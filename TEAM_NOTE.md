hey y'all — small heads up on the repo

I ended up merging the frontend into your repo, Tylin, so we're all working in one place:
https://github.com/tylinndd/nest

my frontend stuff is now in frontend/, yours is still in backend/ totally untouched. the old StephenSook/nest one I had is archived so nothing there to worry about.

the reason I did it this way: I set up a PLAN.md at the root that kinda tracks who's doing what, and it only really works if we're all on the same repo. I already filled in what I've been working on — feel free to add, edit, move rows around, whatever. it's ours, not mine, I just wanted to get a first draft down so we weren't starting from nothing.

there's a little helper script if you want it:
- ./scripts/plan claim 2.1 — marks a row as yours and commits
- ./scripts/plan done 2.1 — marks it done when you finish

totally optional, you can also just edit PLAN.md directly if that's easier. whatever works.

one small thing — there's a "Shared Contracts" section near the bottom for the /ask and /benefits API shapes. if either of you ends up changing the request/response format, a heads up would help me not break the frontend integration. no big deal, just a "hey I changed this" whenever you get to it.

also two open questions in there if you get a sec:
- Tylin — any thoughts on where /ask lives for the C-Day demo? ngrok / vercel / render, whatever's easiest for you
- Brenden — are you feeling good about the flash video, or should we just skip it and focus on the poster? no pressure either way

lmk if any of this doesn't make sense or if you want to change how the repo is structured — nothing's locked in. just tried to save us some setup time.
