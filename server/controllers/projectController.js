if (progress === 0) project.timeline.surveyStarted = new Date();
if (progress === 25) project.timeline.surveyCompleted = new Date();
if (progress === 50) project.timeline.draftingStarted = new Date();
if (progress === 75) project.timeline.draftingCompleted = new Date();
if (progress === 100) project.timeline.finalSubmitted = new Date();
