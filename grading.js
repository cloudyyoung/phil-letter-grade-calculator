
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
        if (course.countTotal) {
            $.grades[course.code].total = 0;
        }
        course.components.forEach((component) => {
            $.grades[course.code][component.code]["null"] = 0;
            component.grades.forEach((activityGrade) => {
                $.grades[course.code][component.code][activityGrade.code] = 0;
            });
        });

        // Calculate total amount for each grades from each component
        course.components.forEach((component) => {
            for (let t = 1; t <= course.units; t++) {
                let grade = $.grades[course.code][component.code][t];
                $.grades[course.code][component.code][grade]++;

                if (course.countTotal && course.countTotalComponentsGrades.includes(grade)) {
                    $.grades[course.code].total++;
                }
            }
        });

        // Set default letter grade & tentative letter grade
        $.grades[course.code].achievedLetterGrade = "F";
        $.grades[course.code].tentativeLetterGrade = "F";

        // Match for grading rules to calculate Letter Grade
        course.rules.forEach((rule) => {
            let matchAchieved = true;
            let matchTentative = true;
            let totalTentative = 0;

            course.components.forEach((component) => {
                let requirements = rule[component.code];

                // Make item grade dictionary
                let activityGradeDictionary = {};
                component.grades.forEach((activityGrade) => {
                    activityGradeDictionary[activityGrade.code] = activityGrade.worth;
                    activityGradeDictionary[activityGrade.worth] = activityGrade.code;
                });

                // If match all component requirements & their amount
                $.each(requirements, (activityGrade, amount) => {
                    let gainedAmountAchieved = $.grades[course.code][component.code][activityGrade];

                    let currentWorth = activityGradeDictionary[activityGrade];
                    if (currentWorth > 0) {
                        while (activityGradeDictionary[++currentWorth] != undefined) {
                            let activityGradeAdd = activityGradeDictionary[currentWorth];
                            gainedAmountAchieved += $.grades[course.code][component.code][activityGradeAdd]
                        }
                    }

                    // Assume all not-selected items are all complete-plus
                    let gainedAmountTentative = gainedAmountAchieved + $.grades[course.code][component.code]["null"];
                    totalTentative += gainedAmountTentative;

                    // Match rule amount
                    if (gainedAmountAchieved < amount) {
                        matchAchieved = false;
                    }

                    // Match rule amount
                    if (gainedAmountTentative < amount) {
                        matchTentative = false;
                    }
                });

            });

            // If match total items
            if ($.grades[course.code].total < rule.total) {
                matchAchieved = false;
            }

            // If match total items
            if (totalTentative < rule.total) {
                matchTentative = false;
            }

            // If match the current grading rule in general
            if (matchAchieved) {
                let letterGrade = this.max($.grades[course.code].achievedLetterGrade, rule.grade);

                if (letterGrade == rule.grade) {
                    $.grades[course.code].achievedLetterGrade = letterGrade;
                    $.grades[course.code].achievedLetterGradeRuleIndex = rule.index;
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

        console.log($.grades[course.code].achievedLetterGrade, $.grades[course.code].tentativeLetterGrade);
    }
};

