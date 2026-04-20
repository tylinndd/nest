"""Intake response shape and content checks for the Maria persona."""

from app.services.intake import build_intake_response


def test_maria_intake_has_tasks_and_days_remaining(maria_profile):
    response = build_intake_response(maria_profile)

    assert response.tasks, "intake should return a non-empty task list"
    assert response.days_remaining is not None
    assert response.days_remaining >= 0
    assert response.eligibility, "intake should return eligibility results"


def test_maria_intake_includes_a_document_task(maria_profile):
    response = build_intake_response(maria_profile)

    document_tasks = [task for task in response.tasks if task.id.startswith("document-")]
    assert document_tasks, "expected at least one document-related task"


def test_maria_intake_surfaces_missing_birth_certificate(maria_profile):
    response = build_intake_response(maria_profile)

    titles = [task.title.lower() for task in response.tasks]
    assert any("birth certificate" in title for title in titles), (
        "Maria is missing her birth certificate, so the task should appear"
    )
