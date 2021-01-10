$(document).ready(() => {

    $(".choices-grade .choice").click(function (e) {
        // Read data from DOM
        let courseCode = $(this).closest(".course").attr("course");
        let activityCode = $(this).closest(".activity").attr("activity");
        let componentGradeCode = $(this).attr("grade");

        // Change state of item grade choice
        if ($(this).hasClass("checked")) {
            $(this).removeClass("checked");
            $(this).closest(".activity").removeClass("active");
            localStorage.removeItem(activityCode);
        } else {
            $(this).parent().children().removeClass("checked");
            $(this).addClass("checked");
            $(this).closest(".activity").addClass("active");
            localStorage.setItem(activityCode, componentGradeCode);
        }

        let course = Course.get(courseCode);
        let [tentativeLetterGrade, tentativeLetterGradeRuleId, achievedLetterGrade, achievedLetterGradeRuleId] = course.calculate(course);

        console.log(tentativeLetterGrade, achievedLetterGrade);

        // Update letter grade table highlights
        $(`.${courseCode} .letter-grade.table .rule-item`).removeClass("is-selected").removeClass("is-locked");
        if (achievedLetterGradeRuleId == tentativeLetterGradeRuleId) {
            $(`.${courseCode} .letter-grade.table .rule-item.rule-${achievedLetterGradeRuleId}`).addClass("is-selected is-locked");
        } else {
            $(`.${courseCode} .letter-grade.table .rule-item.rule-${achievedLetterGradeRuleId}`).addClass("is-selected");
            $(`.${courseCode} .letter-grade.table .rule-item.rule-${tentativeLetterGradeRuleId}`).addClass("is-selected");
        }

        // Upate the grades on letter grade cards
        $(`.${courseCode} .letter-grade.card.tentative-letter-grade .grade`).text(tentativeLetterGrade);
        $(`.${courseCode} .letter-grade.card.achieved-letter-grade .grade`).text(achievedLetterGrade);
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

    Course.list.forEach((course) => {
        course.components.forEach((component) => {
            for (let t = 1; t <= course.units; t++) {
                let activityCode = `${course.code}-${component.code}-${t}`;
                let componentsGrade = localStorage.getItem(activityCode);
                $(`.${activityCode} .choices-grade .button.${componentsGrade}`).click();
            }
        });
    });

});