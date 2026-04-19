from app.schemas import EligibilityResult, TaskItem, UserProfile
from app.services.eligibility import get_bestfit_url


URGENCY_ORDER = {"overdue": 0, "this_week": 1, "soon": 2}

DOCUMENT_TASKS = {
    "birth_certificate": {
        "title": "Request your birth certificate",
        "description": "This is a core identity document that unlocks benefits, school, and housing steps.",
    },
    "ssn_card": {
        "title": "Replace your Social Security card",
        "description": "You will likely need your Social Security card for work, benefits, and enrollment paperwork.",
    },
    "state_id": {
        "title": "Get a Georgia state ID",
        "description": "A state ID helps you verify your identity for nearly every next step.",
    },
    "photo_id": {
        "title": "Get a photo ID",
        "description": "A photo ID is one of the fastest ways to unblock applications and appointments.",
    },
    "immunization_records": {
        "title": "Collect your immunization records",
        "description": "You may need immunization records for school, housing, or healthcare enrollment.",
    },
    "foster_care_verification": {
        "title": "Gather proof of foster care history",
        "description": "This paperwork is commonly needed for benefits designed for former foster youth.",
    },
    "school_enrollment": {
        "title": "Upload your school enrollment proof",
        "description": "Programs like Chafee ETV may need an acceptance letter, class schedule, or enrollment record.",
    },
    "financial_aid": {
        "title": "Complete your financial aid paperwork",
        "description": "Having your FAFSA or aid record ready can speed up education-related applications.",
    },
    "aged_out_letter": {
        "title": "Find paperwork showing you aged out at 18",
        "description": "This can help confirm eligibility for extended foster care support.",
    },
    "placement_history": {
        "title": "Collect your placement history records",
        "description": "Placement records can help verify your foster care background for multiple programs.",
    },
    "foster_care_at_18_proof": {
        "title": "Get proof you were in foster care at 18",
        "description": "This is one of the clearest documents for Medicaid extension eligibility.",
    },
    "medicaid_application": {
        "title": "Start your Medicaid paperwork",
        "description": "Having the application or renewal form ready makes it easier to confirm health coverage.",
    },
    "ksu_student_id": {
        "title": "Get your KSU student ID or enrollment record",
        "description": "KSU ASCEND works best when you can quickly confirm your Kennesaw State enrollment.",
    },
}

PROGRAM_DOCUMENTS = {
    "Chafee ETV": [
        "photo_id",
        "foster_care_verification",
        "school_enrollment",
        "financial_aid",
    ],
    "EYSS (Extended Foster Care)": [
        "photo_id",
        "aged_out_letter",
        "placement_history",
    ],
    "Georgia Medicaid Extended": [
        "photo_id",
        "foster_care_at_18_proof",
        "medicaid_application",
    ],
    "KSU ASCEND": [
        "photo_id",
        "ksu_student_id",
        "foster_care_verification",
    ],
}

CONCERN_TASKS = {
    "housing": {
        "id": "concern-housing",
        "title": "Line up a housing backup plan",
        "description": "Housing is marked as a top concern, so start with a same-day backup option and a longer plan.",
        "urgency": "overdue",
        "due_label": "Today",
        "action_label": "Call 211",
        "action_type": "call",
        "action_target": "211",
    },
    "school": {
        "id": "concern-school",
        "title": "Ask Navigator about school support",
        "description": "Get step-by-step help with enrollment, tuition help, books, and campus support programs.",
        "urgency": "this_week",
        "due_label": "This week",
        "action_label": "Ask Navigator",
        "action_type": "chat",
        "action_target": "school_help",
    },
    "money": {
        "id": "concern-money",
        "title": "Check public benefits on BestFit",
        "description": "Money is a top concern, so review general benefits like SNAP, Medicaid, and cash assistance.",
        "urgency": "this_week",
        "due_label": "This week",
        "action_label": "Open BestFit",
        "action_type": "link",
        "action_target": get_bestfit_url(),
    },
    "health": {
        "id": "concern-health",
        "title": "Ask Navigator about health coverage",
        "description": "Use Nest to figure out coverage, care, and next steps for medical or mental health support.",
        "urgency": "this_week",
        "due_label": "This week",
        "action_label": "Ask Navigator",
        "action_type": "chat",
        "action_target": "health_help",
    },
    "job": {
        "id": "concern-job",
        "title": "Ask Navigator about job and training options",
        "description": "Get help thinking through work, training programs, and what documents you may need first.",
        "urgency": "soon",
        "due_label": "Within 30 days",
        "action_label": "Ask Navigator",
        "action_type": "chat",
        "action_target": "job_help",
    },
}


def generate_tasks(
    profile: UserProfile, eligibility_results: list[EligibilityResult]
) -> list[TaskItem]:
    tasks: list[TaskItem] = []
    seen_ids: set[str] = set()

    for task in _document_tasks(profile, eligibility_results):
        _add_task(tasks, seen_ids, task)

    for task in _qualified_benefit_tasks(eligibility_results):
        _add_task(tasks, seen_ids, task)

    for task in _concern_tasks(profile):
        _add_task(tasks, seen_ids, task)

    for task in _transition_stability_tasks(profile, eligibility_results):
        _add_task(tasks, seen_ids, task)

    return sorted(tasks, key=lambda task: (URGENCY_ORDER[task.urgency], task.id))


def _document_tasks(
    profile: UserProfile, eligibility_results: list[EligibilityResult]
) -> list[TaskItem]:
    document_keys = [
        "birth_certificate",
        "ssn_card",
        "state_id",
    ]

    if "school" in profile.top_concerns or profile.college_intent in {"thinking", "enrolled"}:
        document_keys.extend(["immunization_records", "school_enrollment", "financial_aid"])

    for result in eligibility_results:
        if result.qualified:
            document_keys.extend(PROGRAM_DOCUMENTS.get(result.program, []))

    unique_keys: list[str] = []
    for key in document_keys:
        if key not in unique_keys:
            unique_keys.append(key)

    tasks = []
    for key in unique_keys:
        if not _is_missing_document(profile, key):
            continue

        details = DOCUMENT_TASKS.get(key)
        if details is None:
            continue

        tasks.append(
            TaskItem(
                id=f"document-{key.replace('_', '-')}",
                title=details["title"],
                description=details["description"],
                urgency="overdue" if key in {"birth_certificate", "ssn_card", "state_id", "photo_id"} else "this_week",
                due_label="Today" if key in {"birth_certificate", "ssn_card", "state_id", "photo_id"} else "This week",
                action_label="Open Vault",
                action_type="route",
                action_target="/vault",
                completed=False,
            )
        )

    return tasks


def _qualified_benefit_tasks(eligibility_results: list[EligibilityResult]) -> list[TaskItem]:
    tasks = []

    for result in eligibility_results:
        if not result.qualified:
            continue

        program_slug = result.program.lower().replace(" ", "-").replace("(", "").replace(")", "")
        tasks.append(
            TaskItem(
                id=f"benefit-{program_slug}",
                title=f"Apply for {result.program}",
                description=f"{result.what_it_provides} {result.next_step}",
                urgency="this_week",
                due_label="This week",
                action_label="Open application" if result.apply_url else "Ask Navigator",
                action_type="link" if result.apply_url else "chat",
                action_target=result.apply_url or f"{program_slug}-help",
                completed=False,
            )
        )

    return tasks


def _concern_tasks(profile: UserProfile) -> list[TaskItem]:
    tasks = []

    for concern in profile.top_concerns:
        details = CONCERN_TASKS.get(concern.lower())
        if details is None:
            continue

        tasks.append(
            TaskItem(
                id=details["id"],
                title=details["title"],
                description=details["description"],
                urgency=details["urgency"],
                due_label=details["due_label"],
                action_label=details["action_label"],
                action_type=details["action_type"],
                action_target=details["action_target"],
                completed=False,
            )
        )

    return tasks


def _transition_stability_tasks(
    profile: UserProfile, eligibility_results: list[EligibilityResult]
) -> list[TaskItem]:
    tasks = []
    has_housing_task = "housing" in {concern.lower() for concern in profile.top_concerns}
    qualified_programs = {result.program for result in eligibility_results if result.qualified}

    if profile.status == "aged_out" or (profile.age is not None and profile.age <= 18):
        tasks.append(
            TaskItem(
                id="stability-30-day-plan",
                title="Build your 30-day transition plan",
                description=(
                    "Focus on the next month first: where you will stay, how you will pay for basics, "
                    "and which benefits you can activate right away."
                ),
                urgency="this_week" if qualified_programs else "overdue",
                due_label="This week" if qualified_programs else "Today",
                action_label="Open Path",
                action_type="route",
                action_target="/path",
                completed=False,
            )
        )

    if has_housing_task and profile.status == "aged_out":
        tasks.append(
            TaskItem(
                id="stability-housing-backup",
                title="Keep an emergency housing backup ready",
                description=(
                    "If your main housing plan changes, have a same-day backup option ready so you do not get stuck."
                ),
                urgency="overdue",
                due_label="Today",
                action_label="Ask Navigator",
                action_type="chat",
                action_target="housing_backup_plan",
                completed=False,
            )
        )

    return tasks


def _is_missing_document(profile: UserProfile, key: str) -> bool:
    return profile.documents.get(key) is not True


def _add_task(tasks: list[TaskItem], seen_ids: set[str], task: TaskItem) -> None:
    if task.id in seen_ids:
        return

    seen_ids.add(task.id)
    tasks.append(task)
