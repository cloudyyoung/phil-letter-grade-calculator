
$.letterGrades = {
    percentage: {
        "A+": 100,
        "A": 95,
        "A-": 90,
        "B+": 85,
        "B": 80,
        "B-": 75,
        "C+": 70,
        "C": 65,
        "C-": 60,
        "D+": 55,
        "D": 50,
        "F": 0
    },
    max: function (letterGrade1, letterGrade2) {
        let percentage1 = this.percentage[letterGrade1];
        let percentage2 = this.percentage[letterGrade2];
        if (percentage1 >= percentage2) {
            return letterGrade1;
        } else {
            return letterGrade2;
        }
    },
    calculate: function (course) {
        // Initialize grades amount
        if (course.gradingCountTotal) {
            $.grades[course.code].total = 0;
        }
        course.components.forEach((component) => {
            $.grades[course.code][component.code]["null"] = 0;
            component.grades.forEach((itemGrade) => {
                $.grades[course.code][component.code][itemGrade.code] = 0;
            });
        });

        // Calculate total amount for each grades from each component
        course.components.forEach((component) => {
            for (let t = 1; t <= course.units; t++) {
                let grade = $.grades[course.code][component.code][t];
                $.grades[course.code][component.code][grade]++;

                if (course.gradingCountTotal && course.gradingCountTotalGrades.includes(grade)) {
                    $.grades[course.code].total++;
                }
            }
        });

        // Set default letter grade & tentative letter grade
        $.grades[course.code].letterGrade = "F";
        $.grades[course.code].tentativeLetterGrade = "F";

        // Match for grading rules to calculate Letter Grade
        course.gradingRules.forEach((rule) => {
            let match = true;
            let matchTentative = true;
            let totalTentative = 0;

            course.components.forEach((component) => {
                let requirements = rule[component.code];

                // Make item grade dictionary
                let itemGradeDictionary = {};
                component.grades.forEach((itemGrade) => {
                    itemGradeDictionary[itemGrade.code] = itemGrade.worth;
                    itemGradeDictionary[itemGrade.worth] = itemGrade.code;
                });

                // If match all component requirements & their amount
                $.each(requirements, (itemGrade, amount) => {
                    let gainedAmount = $.grades[course.code][component.code][itemGrade];

                    let currentWorth = itemGradeDictionary[itemGrade];
                    if (currentWorth > 0) {
                        while (itemGradeDictionary[++currentWorth] != undefined) {
                            let itemGradeAdd = itemGradeDictionary[currentWorth];
                            gainedAmount += $.grades[course.code][component.code][itemGradeAdd]
                        }
                    }

                    // Assume all not-selected items are all complete-plus
                    let gainedAmountTentative = gainedAmount + $.grades[course.code][component.code]["null"];
                    totalTentative += gainedAmountTentative;

                    // Match rule amount
                    if (gainedAmount < amount) {
                        match = false;
                    }

                    // Match rule amount
                    if (gainedAmountTentative < amount) {
                        matchTentative = false;
                    }
                });

            });

            // If match total items
            if ($.grades[course.code].total < rule.total) {
                match = false;
            }

            // If match total items
            if (totalTentative < rule.total) {
                matchTentative = false;
            }

            // If match the current grading rule in general
            if (match) {
                let letterGrade = this.max($.grades[course.code].letterGrade, rule.grade);

                if (letterGrade == rule.grade) {
                    $.grades[course.code].letterGrade = letterGrade;
                    $.grades[course.code].letterGradeRuleIndex = rule.index;
                }
            }

            // If match the current grading rule in general
            if (matchTentative) {
                let letterGrade = this.max($.grades[course.code].tentativeLetterGrade, rule.grade);

                if (letterGrade == rule.grade) {
                    $.grades[course.code].tentativeLetterGrade = letterGrade;
                    $.grades[course.code].tentativeLetterGradeRuleIndex = rule.index;
                }
            }
        });

        console.log($.grades[course.code].letterGrade, $.grades[course.code].tentativeLetterGrade);
    }
};

