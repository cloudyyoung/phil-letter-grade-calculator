
$.grades = {};


$.initialize = function (course) {

    $[course.code] = course;
    $.grades[course.code] = {};

    // Intialize count total
    if (!course.gradingCountTotal == undefined) {
        course.gradingCountTotal = false;
        course.gradingCountTotalGrades = [];
    }

    // Sort grading rules by letter grade
    course.gradingRules.sort(function (first, second) {
        return $.letterGrades.percentage[second.grade] - $.letterGrades.percentage[first.grade];
    });

    // Establish dictionary for item grade code and item grade object
    course.gradingActivityGradesDictionary = {};
    course.gradingActivityGrades.forEach((activityGrade) => {
        course.gradingActivityGradesDictionary[activityGrade.code] = activityGrade;
    });

    // Intialize F grade
    course.gradingRules.push({ grade: "F", total: 0 });

    // Initialize rule index
    let ruleIndex = 0;
    course.gradingRules.forEach((rule) => {
        rule.index = ruleIndex++;
    });

    // Sort item grades from low to high
    course.gradingActivityGrades.sort(function (first, second) {
        return first.worth - second.worth;
    });


    // Build form
    course.components.forEach((component) => {
        $.grades[course.code][component.code] = {};

        // Initialize item grades for current component
        if (component.grades) {
            course.gradingActivityGrades.forEach((activityGrade) => {
                if (component.grades.includes(activityGrade.code)) {
                    component.grades.splice(activityGrade.code, 1);
                    component.grades.push(activityGrade);
                }
            });
        } else {
            component.grades = course.gradingActivityGrades;
        }

        // Sort item grades from low to high
        component.grades.sort(function (first, second) {
            return first.worth - second.worth;
        });

        // Initialize unit number
        if (!component.units) {
            component.units = course.units;
        }
    });
};

$.display = function (course) {

    // Insert course into course select tabs
    $(".course-select.tabs ul").append(`<li class="${course.code} course-item" course="${course.code}"><a href="#${course.code}">${course.title}</a></li>`);

    // Build course html
    let courseHtml = `
        <div class="course ${course.code} is-hidden" course="${course.code}" id="${course.code}">
            <section class="section">
                <div class="container">
                    <div class="columns components">
    `;

    // Build form
    course.components.forEach((component) => {
        let componentHtml = `
            <!-- ${component.title} -->
            <div class="column">
                <h5 class="title is-5">${component.title}</h5>
        `;

        for (let t = 1; t <= component.units; t++) {
            $.grades[course.code][component.code][t] = null;
            componentHtml += `
                <!-- Item: Unit ${t} -->
                <div class="columns is-mobile ${component.code} activity" itemType="${component.code}" itemNo="${t}">
                    <!-- Item name -->
                    <div class="column name ${component.code}">
                        ${component.title} ${t}
                    </div>
                    <!-- Choices -->
                    <div class="column">
                        <div class="control choices-grade">
            `;

            component.grades.forEach((activityGrade) => {
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
                </div>
            </section>
    `;


    // Build letter grade table header
    let tableHead = ``;
    course.components.forEach((component) => {
        tableHead += `<th>${component.title}</th>`;
    });

    // Build letter grade table body
    let tableBody = ``;
    course.gradingRules.forEach((rule) => {
        tableBody += `<tr class="rule-item rule-${rule.index} grade-${$.letterGrades.percentage[rule.grade]} grade-${rule.grade}">`;
        tableBody += `<th>${rule.grade}</th>`;

        course.components.forEach((component) => {
            let ruleItemBody = ``;
            let requirements = rule[component.code];

            $.each(requirements, (activityGrade, amount) => {
                let title = course.gradingActivityGradesDictionary[activityGrade].title;
                let icon = course.gradingActivityGradesDictionary[activityGrade].icon;
                let text = course.gradingActivityGradesDictionary[activityGrade].text;
                ruleItemBody += `
                    <div class="column is-narrow">
                        <div class="columns is-mobile" title="${title}: ${amount}" style="width: 60px;">
                            <div class="column is-1">
                                <i class="material-icons ${icon ? "" : "is-hidden"}">${icon}</i>
                                <i class="material-text ${text ? "" : "is-hidden"}">${text}</i>
                            </div>
                            <div class="column is-narrow"><span>${amount}</span></div>
                        </div>
                    </div>
                `;
            });

            if (requirements == undefined) {
                ruleItemBody = `
                    <div class="column is-narrow">
                        <div class="columns is-mobile" title="None">
                            <div class="column is-1">
                                <i class="material-icons">remove</i>
                            </div>
                        </div>
                    </div>
                `;
            }

            tableBody += `<td><div class="columns">${ruleItemBody}</div></td>`;
        });

        if (course.gradingCountTotal) {
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
                                        <th class="${course.gradingCountTotal ? "" : "is-hidden"}">Total</th>
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
                                <p class="title is-2 grade">A+</p>
                                <p class="subtitle">Tentative Letter Grade</p>
                                <p class="description">
                                    This is your tentative letter grade, and also the maximum grade you can potentially get, based on your current completed activities.<br>
                                    It assumes all the rest activities that has not completed yet are going to be completed with the highest mark.
                                </p>
                            </div>
                        </div>

                        <!- Achieved Grade ->
                        <div class="card is-shadowless letter-grade achieved-letter-grade">
                            <div class="card-content">
                                <p class="title is-2 grade">F</p>
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
                                <p class="title is-2"></p>
                                <p class="subtitle"></p>
                                <p class="description">
                                    <i class="material-icons">swap_vertical_circle</i> When your tentative and achieved letter grade overlapse, your final letter grade is locked to this grade, regardless of any uncompleted activities. In this case, if you wish to achieve a higher grade, you should improve the grades of your completed activities.<br><br>
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
};

$(document).ready(() => {
    $(".choices-grade .choice").click(function (e) {
        // Read data from DOM
        let course = $(this).closest(".course").attr("course");
        let gradingItemType = $(this).closest(".activity").attr("itemType");
        let gradingItemNo = $(this).closest(".activity").attr("itemNo");
        let grade = $(this).attr("grade");

        // Change state of item grade choice
        if ($(this).hasClass("checked")) {
            $(this).removeClass("checked");
            $(this).closest(".activity").removeClass("active");
            $.grades[course][gradingItemType][gradingItemNo] = null;
        } else {
            $(this).parent().children().removeClass("checked");
            $(this).addClass("checked");
            $(this).closest(".activity").addClass("active");
            $.grades[course][gradingItemType][gradingItemNo] = grade;
        }

        $.letterGrades.calculate($[course]);

        // Update letter grade table highlights
        $(`.${course} .letter-grade.table .rule-item`).removeClass("is-selected").removeClass("is-locked");
        if ($.grades[course].achievedLetterGradeRuleIndex == $.grades[course].tentativeLetterGradeRuleIndex) {
            $(`.${course} .letter-grade.table .rule-item.rule-${$.grades[course].achievedLetterGradeRuleIndex}`).addClass("is-selected is-locked");
        } else {
            $(`.${course} .letter-grade.table .rule-item.rule-${$.grades[course].achievedLetterGradeRuleIndex}`).addClass("is-selected");
            $(`.${course} .letter-grade.table .rule-item.rule-${$.grades[course].tentativeLetterGradeRuleIndex}`).addClass("is-selected");
        }

        // Upate the grades on letter grade cards
        $(`.${course} .letter-grade.card.tentative-letter-grade .grade`).text($.grades[course].tentativeLetterGrade);
        $(`.${course} .letter-grade.card.achieved-letter-grade .grade`).text($.grades[course].achievedLetterGrade);
    });

    // Default select A+ and F
    $(`.letter-grade.table .rule-item.grade-100`).addClass("is-selected");
    $(`.letter-grade.table .rule-item.grade-0`).addClass("is-selected");

    // Course select tabs
    $(".course-select.tabs .course-item").click(function (e) {
        $(".course-item").removeClass("is-active");
        $(this).addClass("is-active");

        let course = $(this).attr("course");
        $(".course").addClass("is-hidden");
        $(".course").hide();
        $(`.course.${course}`).removeClass("is-hidden");
        $(`.course.${course}`).fadeIn();
    });

    if (window.location.hash) {
        // # in url exists
        $(`.course-select.tabs .course-item.${window.location.hash.substring(1)}`).click();
    } else {
        $(".course-item").first().click();
    }
});