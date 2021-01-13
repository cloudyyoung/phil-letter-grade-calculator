'use strict';

class Course {

    static add(object) {
        if (!Course.list) {
            Course.list = [];
        }
        Course.list.push(new Course(object));
    }

    static get(code) {
        let ret = null
        Course.list.forEach((course) => {
            if (course.code == code) {
                ret = course;
                return;
            }
        });
        return ret;
    }

    constructor(object) {
        this.title = object.title ? object.title : "";
        this.code = object.code ? object.code : "";
        this.components = object.components ? object.components : [];
        this.units = object.units ? object.units : 0;
        this.componentsGrades = object.componentsGrades ? object.componentsGrades : [];
        this.countTotal = object.countTotal ? object.countTotal : false;
        this.countTotalComponentsGrades = object.countTotalComponentsGrades ? object.countTotalComponentsGrades : [];

        // Rules
        let rules = object.rules ? object.rules : [];
        this.rules = [];
        rules.forEach((rule) => {
            this.rules.push(new Rule(rule));
        });

        this._initialize();
        this._display();
    }

    _getProperty(properties, key) {
        if (typeof key == "number") {
            return properties[key];
        } else {
            let ret = null;
            properties.forEach((property) => {
                if (property.code == key) {
                    ret = property;
                    return;
                }
            });
            return ret;
        }
    }

    _getComponent(key) {
        return this._getProperty(this.components, key);
    }

    _getComponentsGrade(key) {
        return this._getProperty(this.componentsGrades, key);
    }

    _initialize() {
        // Sort grading rules by letter grade
        this.rules.sort(function (first, second) {
            return LetterGrade.getPercentage(second.grade) - LetterGrade.getPercentage(first.grade);
        });

        // Intialize F grade
        this.rules.push(new Rule({ grade: "F" }));

        // Sort activity grades from low to high
        this.componentsGrades.sort(function (first, second) {
            return first.worth - second.worth;
        });

        // Build each component
        this.components.forEach((component) => {
            // Initialize item grades for current component
            if (component.componentsGrades) {
                this.componentsGrades.forEach((componentsGrade) => {
                    if (component.componentsGrades.includes(componentsGrade.code)) {
                        component.componentsGrades.splice(componentsGrade.code, 1);
                        component.componentsGrades.push(componentsGrade);
                    }
                });
            } else {
                component.componentsGrades = this.componentsGrades;
            }

            // Sort item grades from low to high
            component.componentsGrades.sort(function (first, second) {
                return first.worth - second.worth;
            });

            // Initialize unit number
            if (!component.units) {
                component.units = this.units;
            }
        });
    }

    _display() {
        // Insert course into course select tabs
        $(".course-select.tabs ul").append(`<li class="${this.code} course-item" course="${this.code}"><a href="#${this.code}">${this.title}</a></li>`);

        // Build course html
        let courseHtml = `
            <div class="course ${this.code} is-hidden" course="${this.code}" id="${this.code}">
                <section class="section">
                    <div class="container">
                        <div class="columns components is-multiline">
        `;

        // Build activity form
        this.components.forEach((component) => {
            let componentHtml = `
                <!-- ${component.title} -->
                <div class="column ${component.code} is-one-third-widescreen is-half-tablet">
                    <h5 class="title is-5">${component.title}</h5>
            `;

            for (let t = 1; t <= component.units; t++) {
                componentHtml += `
                    <!-- Item: Unit ${t} -->
                    <div class="columns is-mobile activity ${component.code} ${t} ${this.code}-${component.code}-${t}" activity="${this.code}-${component.code}-${t}">
                        <!-- Item name -->
                        <div class="column name ${component.code}">
                            ${component.title} ${t}
                        </div>
                        <!-- Choices -->
                        <div class="column">
                            <div class="control choices-grade">
                `;

                component.componentsGrades.forEach((activityGrade) => {
                    componentHtml += `
                        <!-- ${activityGrade.title} -->
                        <a class="button is-white is-rounded choice ${activityGrade.code}" title="${activityGrade.title}" grade="${activityGrade.code}">
                            <i class="material-icons ${activityGrade.icon ? "" : "is-hidden"}">${activityGrade.icon}</i>
                            <i class="material-text ${activityGrade.text ? "" : "is-hidden"}">${activityGrade.text}</i>
                        </a>
                    `;
                });

                componentHtml += `
                                </div>
                            </div>
                        </div>
                `;
            }
            componentHtml += `</div>`;
            courseHtml += componentHtml;
        });

        courseHtml += `
                        </div>

                        <div class="notification local-storage-info">
                            <i class="material-icons">info</i>
                            Your grades for activities will be saved in local storage in your browser, they are not shared with anyone.
                            When coming back, your grades for activities should still be here.
                            However, you will lose them if you clear your browser cache, and your cleaning software might do it for you.
                        </div>

                    </div>
                </section>
        `;

        // Build letter grade table header
        let tableHead = ``;
        this.components.forEach((component) => {
            tableHead += `<th>${component.title}</th>`;
        });

        // Build letter grade table body
        let tableBody = ``;
        this.rules.forEach((rule) => {
            tableBody += `<tr class="rule-item rule-${rule.id} grade-${LetterGrade.getPercentage(rule.grade)} grade-${rule.grade}">`;
            tableBody += `<th>${rule.grade}</th>`;

            this.components.forEach((component) => {
                tableBody += `<td><div class="columns">`;

                if (rule.hasRequirements(component.code)) {
                    $.each(rule.getRequirement(component.code), (activityGradeCode, amount) => {
                        let activityGrade = this._getComponentsGrade(activityGradeCode);
                        tableBody += `
                            <div class="column is-narrow">
                                <div class="columns is-mobile" title="${activityGrade.title}: ${amount}" style="width: 60px;">
                                    <div class="column is-1">
                                        <i class="material-icons ${activityGrade.icon ? "" : "is-hidden"}">${activityGrade.icon}</i>
                                        <i class="material-text ${activityGrade.text ? "" : "is-hidden"}">${activityGrade.text}</i>
                                    </div>
                                    <div class="column is-narrow"><span>${amount}</span></div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    tableBody += `
                        <div class="column is-narrow">
                            <div class="columns is-mobile" title="None">
                                <div class="column is-1">
                                    <i class="material-icons">remove</i>
                                </div>
                            </div>
                        </div>
                    `;
                }

                tableBody += `</div></td>`;
            });

            if (this.countTotal) {
                tableBody += `<td>${rule.total}</td>`;
            }

            tableBody += `</tr>`;
        });

        courseHtml += `
                
                <section class="section">
                    <div class="container">

                    <div class="columns">
                        <div class="column is-8">
                            
                            <!-- Letter Grade Table -->
                            <div class="table-container">
                                <table class="table is-hoverable is-fullwidth letter-grade">
                                    <thead>
                                        <tr>
                                            <th><abbr title="Letter Grade">Grade</abbr></th>
                                            ${tableHead}
                                            <th class="${this.countTotal ? "" : "is-hidden"}">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableBody}
                                    </tbody>
                                </table >
                            </div>

                        </div>

                        <div class="column">

                            <!- Tentative Grade ->
                            <div class="card is-shadowless letter-grade tentative-letter-grade">
                                <div class="card-content">
                                    <h2 class="title is-2 grade">A+</h2>
                                    <p class="subtitle">Tentative Letter Grade</p>
                                    <p class="description">
                                        This is your tentative letter grade, and also the maximum grade you can potentially get, based on your current completed activities.<br>
                                        It assumes all the incompleted activities are going to be completed with the highest mark.
                                    </p>
                                </div>
                            </div>

                            <!- Achieved Grade ->
                            <div class="card is-shadowless letter-grade achieved-letter-grade">
                                <div class="card-content">
                                    <h2 class="title is-2 grade">F</h2>
                                    <p class="subtitle">Achieved Letter Grade</p>
                                    <p class="description">
                                        This is the letter grade you have already achieved, your final grade will never be lower than this grade. <br>
                                        If you stop completing any activities at this point, then this will be your final letter grade by the end of course.
                                    </p>
                                </div>
                            </div>

                            <!- Disclaimer ->
                            <div class="card is-shadowless disclaimer">
                                <div class="card-content">
                                    <h2 class="title is-2"></h2>
                                    <p class="subtitle"></p>
                                    <p class="description">
                                        <i class="material-icons">swap_vertical_circle</i> When your tentative and achieved letter grade overlapse, your final letter grade is locked to this grade, regardless of any incompleted activities. In this case, if you wish to achieve a higher grade, you should improve the grades of your completed activities.<br><br>
                                        <i class="material-icons">info</i> The calculator only provides a general reference of your grade, please subject to your professor.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        `;

        $(`body`).append(courseHtml);
    }

    calculate() {
        // Variables
        let total = 0;
        let componentsGradesCount = {};
        let achievedLetterGrade;
        let tentativeLetterGrade;
        let achievedLetterGradeRuleId;
        let tentativeLetterGradeRuleId;

        // Initialize componentGradesCount
        this.components.forEach((component) => {
            componentsGradesCount[component.code] = {};
            componentsGradesCount[component.code]["null"] = 0;
            component.componentsGrades.forEach((componentGrade) => {
                componentsGradesCount[component.code][componentGrade.code] = 0;
            });
        });

        // Calculate total amount for component grades from each activity
        this.components.forEach((component) => {
            for (let t = 1; t <= component.units; t++) {
                let componentGradeCode = localStorage.getItem(`${this.code}-${component.code}-${t}`);
                componentsGradesCount[component.code][componentGradeCode]++;

                if (this.countTotal && this.countTotalComponentsGrades.includes(componentGradeCode)) {
                    total++;
                }
            }
        });

        // Set default letter grade & tentative letter grade
        componentsGradesCount.achievedLetterGrade = "F";
        componentsGradesCount.tentativeLetterGrade = "F";

        // Match for grading rules to calculate Letter Grade
        this.rules.forEach((rule) => {
            let matchAchieved = true;
            let matchTentative = true;
            let totalTentative = 0;

            this.components.forEach((component) => {
                let requirements = rule.getRequirement(component.code);

                // Make components grade dictionary
                let componentsGradesWorth = {};
                component.componentsGrades.forEach((componentsGrade) => {
                    componentsGradesWorth[componentsGrade.code] = componentsGrade.worth;
                    componentsGradesWorth[componentsGrade.worth] = componentsGrade.code;
                });

                // If match all component requirements & their amount
                $.each(requirements, (componentsGradeCode, amount) => {
                    let gainedAmountAchieved = componentsGradesCount[component.code][componentsGradeCode];

                    let currentWorth = componentsGradesWorth[componentsGradeCode];
                    if (currentWorth > 0) {
                        while (componentsGradesWorth[++currentWorth] != undefined) {
                            let componentsGradeCodeNext = componentsGradesWorth[currentWorth];
                            gainedAmountAchieved += componentsGradesCount[component.code][componentsGradeCodeNext]
                        }
                    }

                    // Assume all not-selected items are all complete-plus
                    let gainedAmountTentative = gainedAmountAchieved + componentsGradesCount[component.code]["null"];
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
            if (this.countTotal && total < rule.total) {
                matchAchieved = false;
            }

            // If match total items
            if (this.countTotal && totalTentative < rule.total) {
                matchTentative = false;
            }

            // If match the current grading rule in general
            if (matchAchieved) {
                let letterGrade = LetterGrade.max(achievedLetterGrade, rule.grade);

                if (letterGrade == rule.grade) {
                    achievedLetterGrade = letterGrade;
                    achievedLetterGradeRuleId = rule.id;
                }
            }

            // If match the current grading rule in general
            if (matchTentative) {
                let letterGrade = LetterGrade.max(tentativeLetterGrade, rule.grade);

                if (letterGrade == rule.grade) {
                    tentativeLetterGrade = letterGrade;
                    tentativeLetterGradeRuleId = rule.id;
                }
            }
        });

        return [tentativeLetterGrade, tentativeLetterGradeRuleId, achievedLetterGrade, achievedLetterGradeRuleId];
    }
}

class Rule {

    constructor(obj) {
        if (!Rule._nextId) {
            Rule._nextId = 0;
        }
        this.grade = obj.grade ? obj.grade : "F";
        this.total = obj.total ? obj.total : 0;
        this._requirements = obj.requirements ? obj.requirements : {};
        this.id = Rule._nextId++;
    }

    hasRequirements() {
        for (let key in this._requirements) { return true; }
        return false;
    }

    hasRequirement(code) {
        for (let key in this._requirements) {
            if (key == code) return true;
        }
        return false;
    }

    getRequirements() {
        return this._requirements || null;
    }

    getRequirement(key) {
        return this._requirements[key] || null;
    }
}

class LetterGrade {
    static max(letterGrade1, letterGrade2) {
        let percentage1 = LetterGrade._percentage[letterGrade1];
        let percentage2 = LetterGrade._percentage[letterGrade2];
        if (percentage1 >= percentage2) {
            return letterGrade1;
        } else {
            return letterGrade2;
        }
    }

    static getPercentage(letterGrade) {
        let percentage = {
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
        };
        return percentage[letterGrade];
    }
}

Course.add({
    title: "PHIL 279",
    code: "PHIL-279",
    components: [
        { title: "Problem Set", code: "problem-set" },
        { title: "Quiz", code: "quiz" },
        { title: "Challenge Problem", code: "challenge-problem", componentsGrades: ["incomplete", "complete"] },
    ],
    units: 12, // the number of units/amount for each component
    componentsGrades: [ // possible grades for each graded item, default is all of them
        { title: "Complete+", code: "complete-plus", icon: "done_all", worth: 2 },
        { title: "Complete", code: "complete", icon: "done", worth: 1 },
        { title: "Incomplete", code: "incomplete", icon: "remove", worth: 0 },
    ],
    countTotal: true, // If total amount is a condition for final letter grade
    countTotalComponentsGrades: ["complete", "complete-plus"], // Item grades that counts towards the total amount
    rules: [
        { grade: "A+", total: 36, requirements: { "problem-set": { "complete-plus": 12 }, "quiz": { "complete-plus": 12 }, "challenge-problem": { "complete": 12 } } },
        { grade: "A", total: 36, requirements: { "problem-set": { "complete": 12, "complete-plus": 10 }, "quiz": { "complete": 12, "complete-plus": 10 }, "challenge-problem": { "complete": 12 } } },
        { grade: "A-", total: 33, requirements: { "problem-set": { "complete": 11, "complete-plus": 8 }, "quiz": { "complete": 11, "complete-plus": 8 }, "challenge-problem": { "complete": 11 } } },
        { grade: "B+", total: 32, requirements: { "problem-set": { "complete": 10 }, "quiz": { "complete": 10 }, "challenge-problem": { "complete": 10 } } },
        { grade: "B", total: 30, requirements: { "problem-set": { "complete": 10 }, "quiz": { "complete": 10 }, "challenge-problem": { "complete": 10 } } },
        { grade: "B-", total: 28, requirements: { "problem-set": { "complete": 8 }, "quiz": { "complete": 8 }, "challenge-problem": { "complete": 8 } } },
        { grade: "C+", total: 26, requirements: { "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 } } },
        { grade: "C", total: 24, requirements: { "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 } } },
        { grade: "C-", total: 22, requirements: { "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 } } },
        { grade: "D+", total: 20, requirements: { "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 } } },
        { grade: "D", total: 18, requirements: { "problem-set": { "complete": 6 }, "quiz": { "complete": 6 }, "challenge-problem": { "complete": 6 } } },
    ]
});

Course.add({
    title: "PHIL 379",
    code: "PHIL-379",
    components: [
        { title: "Quiz", code: "quiz", componentsGrades: ["incomplete", "complete"] },
        { title: "Weekly Test", code: "weekly-test", componentsGrades: ["incomplete", "pass"] },
        { title: "Basic Problem", code: "basic-problem", componentsGrades: ["N", "R", "M", "E"] },
        { title: "Challenge Problem", code: "challenge-problem", units: 4, componentsGrades: ["N", "R", "M", "E"] },
        { title: "Group Work", code: "group-work", units: 5, componentsGrades: ["incomplete", "submit"] }, // override default units 10 to 5
    ],
    units: 10, // the number of units/amount for each component
    componentsGrades: [
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
    rules: [
        { grade: "A+", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 10 }, "basic-problem": { "M": 10, "E": 9 }, "challenge-problem": { "M": 3, "E": 3 }, "group-work": { "submit": 5 } } },
        { grade: "A", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 10 }, "basic-problem": { "M": 10, "E": 5 }, "challenge-problem": { "M": 3 }, "group-work": { "submit": 5 } } },
        { grade: "A-", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 10 }, "basic-problem": { "M": 10, "E": 5 }, "challenge-problem": { "M": 3 }, "group-work": { "submit": 4 } } },

        { grade: "B+", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 10, "E": 5 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 4 } } },
        { grade: "B+", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 8, "E": 1 }, "challenge-problem": { "M": 3 }, "group-work": { "submit": 4 } } },
        { grade: "B", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 8, "E": 1 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 4 } } },
        { grade: "B-", requirements: { "quiz": { "complete": 7 }, "weekly-test": { "pass": 8 }, "basic-problem": { "M": 8, "E": 1 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 3 } } },

        { grade: "C+", requirements: { "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 8, "E": 1 }, "group-work": { "submit": 3 } } },
        { grade: "C+", requirements: { "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 6 }, "challenge-problem": { "M": 1 }, "group-work": { "submit": 3 } } },
        { grade: "C", requirements: { "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 6 }, "group-work": { "submit": 3 } } },
        { grade: "C-", requirements: { "quiz": { "complete": 5 }, "weekly-test": { "pass": 7 }, "basic-problem": { "M": 6 } } },

        { grade: "D+", requirements: { "quiz": { "complete": 5 }, "weekly-test": { "pass": 5 }, "basic-problem": { "M": 6 } } },
        { grade: "D", requirements: { "quiz": { "complete": 5 }, "weekly-test": { "pass": 5 }, "basic-problem": { "R": 5, "M": 3 } } },
    ]
});