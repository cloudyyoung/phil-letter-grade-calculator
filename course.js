
$.PHIL279 = {
    code: "PHIL-279",
    components: [
        { title: "Problem Set", code: "problem-set" },
        { title: "Quiz", code: "quiz" },
        { title: "Challenge Problem", code: "challenge-problem", grades: ["incomplete", "complete"] },
    ],
    units: 12, // the number of units/amount for each component
    gradingItemGrades: [ // possible grades for each graded item, default is all of them
        { title: "Complete+", code: "complete-plus", icon: "done_all", worth: 2 },
        { title: "Complete", code: "complete", icon: "done", worth: 1 },
        { title: "Incomplete", code: "incomplete", icon: "remove", worth: 0 },
    ],
    gradingCountTotal: true, // If total amount is a condition for final letter grade
    gradingCountTotalGrades: ["complete", "complete-plus"], // Item grades that counts towards the total amount
    gradingRules: [
        { grade: "A+", "problem-set": { "complete-plus": 12 }, "quiz": { "complete-plus": 12 }, "challenge-problem": { "complete": 12 }, total: 36 },
        { grade: "A", "problem-set": { "complete": 12, "complete-plus": 10 }, "quiz": { "complete": 12, "complete-plus": 10 }, "challenge-problem": { "complete": 12 }, total: 36 },
        { grade: "A-", "problem-set": { "complete": 11, "complete-plus": 8 }, "quiz": { "complete": 11, "complete-plus": 8 }, "challenge-problem": { "complete": 11 }, total: 33 },
        { grade: "B+", "problem-set": { "complete": 10 }, "quiz": { "complete": 10 }, "challenge-problem": { "complete": 10 }, total: 32 },
        { grade: "B", "problem-set": { "complete": 10 }, "quiz": { "complete": 10 }, "challenge-problem": { "complete": 10 }, total: 30 },
        { grade: "B-", "problem-set": { "complete": 8 }, "quiz": { "complete": 8 }, "challenge-problem": { "complete": 8 }, total: 28 },
        { grade: "C+", "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 }, total: 26 },
        { grade: "C", "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 }, total: 24 },
        { grade: "C-", "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 }, total: 22 },
        { grade: "D+", "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 }, total: 20 },
        { grade: "D", "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 }, total: 18 },
    ]
};
$.initialize($.PHIL279);


$.PHIL379 = {
    code: "PHIL-379",
    components: [
        { title: "Quiz", code: "quiz", grades: ["incomplete", "complete"] },
        { title: "Weekly Test", code: "weekly-test", grades: ["incomplete", "pass"] },
        { title: "Basic Problem", code: "basic-problem", grades: ["N", "R", "M", "E"] },
        { title: "Challenge Problem", code: "challenge-problem", units: 4, grades: ["N", "R", "M", "E"] },
        { title: "Group Work", code: "group-work", units: 5, grades: ["incomplete", "submit"] }, // override default units 10 to 5
    ],
    units: 10, // the number of units/amount for each component
    gradingItemGrades: [
        // EMRN
        { title: "Exemplary", code: "E", text: "E", worth: 4 },
        { title: "Meet Expectation", code: "M", text: "M", worth: 3 },
        { title: "Revision Needed", code: "R", text: "R", worth: 2 },
        { title: "Not Assessable", code: "N", text: "N", worth: 1 },

        // Extra item grades
        { title: "Pass", code: "pass", icon: "done", worth: 1 },
        { title: "Complete", code: "complete", icon: "done", worth: 1 },
        { title: "Submit", code: "submit", icon: "done", worth: 1 },
        { title: "Incomplete", code: "incomplete", icon: "remove", worth: 0 },
    ],
    gradingRules: [
        { grade: "A+", "quiz": { "complete": 7 }, "weekly-test": { "pass": 10 }, "basic-problem": { "M": 10, "E": 9 }, "challenge-problem": { "M": 3, "E": 3 }, "group-work": { "submit": 5 } },
        { grade: "A", "quiz": { "complete": 7 }, "weekly-test": { "pass": 10 }, "basic-problem": { "M": 10, "E": 5 }, "challenge-problem": { "M": 3 }, "group-work": { "submit": 5 } },
        { grade: "A-", "quiz": { "complete": 7 }, "weekly-test": { "pass": 10 }, "basic-problem": { "M": 10, "E": 5 }, "challenge-problem": { "M": 3 }, "group-work": { "submit": 4 } },

        { grade: "B+", "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 10, "E": 5 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 4 } },
        { grade: "B+", "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 8, "E": 1 }, "challenge-problem": { "M": 3 }, "group-work": { "submit": 4 } },
        { grade: "B", "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 8, "E": 1 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 4 } },
        { grade: "B-", "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 8, "E": 1 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 3 } },

        { grade: "C+", "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 8, "E": 1 }, "group-work": { "submit": 3 } },
        { grade: "C+", "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 6 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 3 } },
        { grade: "C", "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 6 }, "group-work": { "submit": 3 } },
        { grade: "C-", "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 6 } },

        { grade: "D+", "quiz": { "complete": 5 }, "weekly-test": { "pass": 5 }, "basic-problem": { "M": 6 } },
        { grade: "D", "quiz": { "complete": 5 }, "weekly-test": { "pass": 5 }, "basic-problem": { "R": 5, "M": 3 } },
    ]
};
$.initialize($.PHIL379);
