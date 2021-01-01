
$.grades = {};


$.initialize = function (course) {

    $[course.code] = course;
    $.grades[course.code] = {};

    // Sort item grades from low to high
    course.gradingItemGrades.sort(function (first, second) {
        return first.worth - second.worth;
    });

    // Intialize count total
    if (!course.gradingCountTotal == undefined) {
        course.gradingCountTotal = false;
        course.gradingCountTotalGrades = [];
    }

    // Sort grading rules by letter grade
    course.gradingRules.sort(function (first, second) {
        return $.letterGrades.percentage[second.grade] - $.letterGrades.percentage[first.grade];
    });



    let courseHtml = `
        <div class="course ${course.code}" course="${course.code}">
            <section class="section">
                <div class="container">
                    <div class="columns components">
    `;

    course.components.forEach((component) => {
        $.grades[course.code][component.code] = {};

        // Initialize item grades for current component
        if (component.grades) {
            course.gradingItemGrades.forEach((itemGrade) => {
                if (component.grades.includes(itemGrade.code)) {
                    component.grades.splice(itemGrade.code, 1);
                    component.grades.push(itemGrade);
                }
            });
        } else {
            component.grades = course.gradingItemGrades;
        }

        // Sort item grades from low to high
        component.grades.sort(function (first, second) {
            return first.worth - second.worth;
        });

        // Initialize unit number
        if (!component.units) {
            component.units = course.units;
        }



        let componentHtml = `
            <!-- ${component.title} -->
            <div class="column">
                <h4 class="title is-4">${component.title}</h4>
        `;

        for (let t = 1; t <= component.units; t++) {
            $.grades[course.code][component.code][t] = null;
            componentHtml += `
                <!-- Item: Unit ${t} -->
                <div class="columns is-mobile ${component.code} grading-item" itemType="${component.code}" itemNo="${t}">
                    <!-- Item name -->
                    <div class="column name ${component.code}">
                        ${component.title} ${t}
                    </div>
                    <!-- Choices -->
                    <div class="column">
                        <div class="control choices-grade">
            `;

            component.grades.forEach((itemGrade) => {
                componentHtml += `
                    <!-- ${itemGrade.title} -->
                    <a class="button is-white is-rounded choice ${itemGrade.code}" title="${itemGrade.title}" grade="${itemGrade.code}">
                        <i class="material-icons ${itemGrade.icon ? "" : "hide"}">${itemGrade.icon}</i>
                        <i class="text ${itemGrade.text ? "" : "hide"}">${itemGrade.text}</i>
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

    let tableHead = ``;
    course.components.forEach((component) => {
        tableHead += `<th>${component.title}</th>`;
    });


    let tableBody = ``;
    course.gradingRules.forEach((rule) => {
        tableBody += `<tr class="">`;
        tableBody += `<th>${rule.grade}</th>`;

        course.components.forEach((component) => {
            tableBody += `<td>`;
            let requirements = rule[component.code];
            $.each(requirements, (itemGrade, amount) => {
                tableBody += `<span>${itemGrade} ${amount}</span>`;
            });
            tableBody += `</td>`;
        });

        tableBody += `</tr>`;
    });


    courseHtml += `
            <section class="section>
                <div class="container">

                <!-- Letter Grade Table -->
                <table class="table letter-grade">
                    <thead>
                        <tr>
                            <th><abbr title="Letter Grade">Grade</abbr></th>
                            ${tableHead}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableBody}
                    </tbody>
                </table >
            </section>
        </div>
    `;


    $(`body`).append(courseHtml);
};


$(document).ready(() => {
    $(".choices-grade .choice").click(function (e) {
        let course = $(this).closest(".course").attr("course");
        let gradingItemType = $(this).closest(".grading-item").attr("itemType");
        let gradingItemNo = $(this).closest(".grading-item").attr("itemNo");
        let grade = $(this).attr("grade");

        if ($(this).hasClass("checked")) {
            $(this).removeClass("checked");
            $(this).closest(".grading-item").removeClass("active");
            $.grades[course][gradingItemType][gradingItemNo] = null;
        } else {
            $(this).parent().children().removeClass("checked");
            $(this).addClass("checked");
            $(this).closest(".grading-item").addClass("active");
            $.grades[course][gradingItemType][gradingItemNo] = grade;
        }

        $.letterGrades.calculate($[course]);
    });
});