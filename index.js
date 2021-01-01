
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



    let courseHtml = `
        <section class="section ${course.code}" course="${course.code}">
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

    $(`body`).append(courseHtml);
};


$(document).ready(() => {
    $(".choices-grade .choice").click(function (e) {
        let course = $(this).closest(".section").attr("course");
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