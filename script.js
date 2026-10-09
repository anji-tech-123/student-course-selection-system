// ==========================================
// STUDENT COURSE SELECTION SYSTEM
// DML SET OPERATIONS
// ==========================================


// ==========================================
// 1. UNION OPERATION
// ==========================================

// Set A = Major required courses
const majorCourses = [
    "Database Management Systems",
    "Machine Learning",
    "Data Structures"
];

// Set B = Popular courses
const popularCourses = [
    "Machine Learning",
    "Cloud Computing",
    "Cyber Security"
];

// Set C = Elective courses
const electiveCourses = [
    "Cloud Computing",
    "Data Mining",
    "Artificial Intelligence"
];


const recommendationSets = {
    major: majorCourses,
    popular: popularCourses,
    elective: electiveCourses
};


// Display UNION results
function displayRecommendations() {

    const recommendationList =
        document.getElementById("recommendation-list");

    recommendationList.innerHTML = "";

    const recommendedCourses = [...new Set(
        Object.values(recommendationSets).flat()
    )];

    recommendedCourses.forEach(course => {

        const card = document.createElement("div");

        card.className = "recommendation-card";

        card.innerHTML = `
            <h3>📚 ${course}</h3>
            <p>Recommended for you</p>
        `;

        recommendationList.appendChild(card);
    });
}


// ==========================================
// 2. INTERSECT OPERATION
// ==========================================

// ==========================================
// 3. EXCEPT OPERATION
// ==========================================

// All courses required for the degree
const requiredCourses = [
    "Database Management Systems",
    "Machine Learning",
    "Data Structures",
    "Operating Systems",
    "Computer Networks",
    "Cloud Computing"
];

// Courses already completed by student
const completedCourses = [
    "Database Management Systems",
    "Data Structures",
    "Cloud Computing"
];


function renderSetOperationResults(containerId, values, emptyMessage, itemClass = "") {

    const resultContainer = document.getElementById(containerId);

    if (!resultContainer) {
        return;
    }

    resultContainer.innerHTML = "";

    if (values.length === 0) {
        const message = document.createElement("p");
        message.className = itemClass === "conflict-result"
            ? "success-result"
            : "operation-empty-result";
        message.textContent = emptyMessage;
        resultContainer.appendChild(message);
        return;
    }

    values.forEach(value => {
        const resultItem = document.createElement("span");
        resultItem.className = `result-item ${itemClass}`.trim();
        resultItem.textContent = value;
        resultContainer.appendChild(resultItem);
    });
}


function getSelectedRecommendationSets() {
    return [...document.querySelectorAll('input[name="recommendation-set"]:checked')]
        .map(input => recommendationSets[input.value]);
}


function displayUnionResults() {
    displayCourseSetOperation("union");
}


function displayIntersectionResults() {
    displayCourseSetOperation("intersection");
}


function displayExceptResults() {
    const remainingRequirements = [...new Set(requiredCourses)].filter(
        course => !completedCourses.includes(course) &&
            !selectedCourses.includes(course)
    );

    renderSetOperationResults(
        "degree-gap-result",
        remainingRequirements,
        "All degree requirements are selected or complete."
    );
}


function getCourseSetOperations() {
    const setA = [...new Set(selectedCourses)];
    const setB = [...new Set(getSelectedRecommendationSets().flat())];
    const universalSet = [...document.querySelectorAll(".course-card h3")]
        .map(heading => heading.textContent.trim());
    const setAValues = new Set(setA);
    const setBValues = new Set(setB);
    const aExceptB = setA.filter(course => !setBValues.has(course));
    const bExceptA = setB.filter(course => !setAValues.has(course));

    return {
        union: {
            containerId: "union-result",
            values: [...new Set([...setA, ...setB])],
            emptyMessage: "Select courses in A or enable a recommendation relation in B."
        },
        intersection: {
            containerId: "intersect-result",
            values: setA.filter(course => setBValues.has(course)),
            emptyMessage: "A and B have no courses in common."
        },
        difference: {
            containerId: "except-result",
            values: aExceptB,
            emptyMessage: "Every selected course is also in B, or A is empty."
        },
        reverseDifference: {
            containerId: "reverse-difference-result",
            values: bExceptA,
            emptyMessage: "Every course in B is selected, or B is empty."
        },
        symmetricDifference: {
            containerId: "symmetric-difference-result",
            values: [...aExceptB, ...bExceptA],
            emptyMessage: "A and B contain the same courses."
        },
        cartesianProduct: {
            containerId: "cartesian-product-result",
            values: setA.flatMap(courseA => setB.map(courseB => `(${courseA}, ${courseB})`)),
            emptyMessage: "Add at least one course to both A and B to create pairs."
        },
        complement: {
            containerId: "complement-result",
            values: universalSet.filter(course => !setAValues.has(course)),
            emptyMessage: "A contains every course in the universal course set."
        }
    };
}


function displayCourseSetOperation(operationName) {
    const operation = getCourseSetOperations()[operationName];

    if (operation) {
        renderSetOperationResults(
            operation.containerId,
            operation.values,
            operation.emptyMessage
        );
    }
}


function updateCourseSetOperations() {
    Object.keys(getCourseSetOperations()).forEach(displayCourseSetOperation);
}


function renderCompletedCourseOptions() {
    const options = document.getElementById("completed-course-options");
    options.innerHTML = "";

    requiredCourses.forEach(course => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = course;
        checkbox.checked = completedCourses.includes(course);
        checkbox.addEventListener("change", () => {
            if (checkbox.checked && !completedCourses.includes(course)) {
                completedCourses.push(course);
            } else if (!checkbox.checked) {
                const courseIndex = completedCourses.indexOf(course);
                if (courseIndex !== -1) {
                    completedCourses.splice(courseIndex, 1);
                }
            }
            displayExceptResults();
        });

        label.append(checkbox, document.createTextNode(course));
        options.appendChild(label);
    });
}


const scheduleDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


function getSelectedScheduleEntries() {
    return selectedCourses.flatMap(courseName => {
        const courseCard = [...document.querySelectorAll(".course-card")].find(
            card => card.querySelector("h3").textContent.trim() === courseName
        );

        if (!courseCard) {
            return [];
        }

        return JSON.parse(courseCard.dataset.meetings || "[]").map(meeting => ({
            ...meeting,
            courseName
        }));
    });
}


function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}


function formatScheduleTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}


function renderSchedule() {
    const scheduleList = document.getElementById("schedule-list");
    const scheduleEntries = getSelectedScheduleEntries().sort((first, second) =>
        scheduleDays.indexOf(first.day) - scheduleDays.indexOf(second.day) ||
        timeToMinutes(first.start) - timeToMinutes(second.start)
    );

    scheduleList.innerHTML = "";

    if (scheduleEntries.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "schedule-empty-state";
        emptyState.textContent = "No courses selected.";
        scheduleList.appendChild(emptyState);
        return;
    }

    scheduleEntries.forEach(entry => {
        const scheduleItem = document.createElement("div");
        scheduleItem.className = "schedule-item";

        const day = document.createElement("strong");
        day.textContent = entry.day;

        const time = document.createElement("span");
        time.textContent = `${formatScheduleTime(entry.start)} - ${formatScheduleTime(entry.end)}`;

        const course = document.createElement("p");
        course.textContent = entry.courseName;

        scheduleItem.append(day, time, course);
        scheduleList.appendChild(scheduleItem);
    });
}


function checkScheduleConflict() {
    const scheduleEntries = getSelectedScheduleEntries();
    const conflicts = [];

    for (let firstIndex = 0; firstIndex < scheduleEntries.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < scheduleEntries.length; secondIndex += 1) {
            const first = scheduleEntries[firstIndex];
            const second = scheduleEntries[secondIndex];
            const overlaps = first.day === second.day &&
                timeToMinutes(first.start) < timeToMinutes(second.end) &&
                timeToMinutes(second.start) < timeToMinutes(first.end);

            if (first.courseName !== second.courseName && overlaps) {
                conflicts.push(
                    `${first.day} ${formatScheduleTime(first.start)} - ${formatScheduleTime(first.end)}: ` +
                    `${first.courseName} conflicts with ${second.courseName}`
                );
            }
        }
    }

    renderSetOperationResults(
        "schedule-conflict-result",
        conflicts,
        scheduleEntries.length > 0
            ? "No schedule conflicts found."
            : "Select courses to check for schedule conflicts.",
        "conflict-result"
    );
}


// ==========================================
// 4. COURSE SELECTION
// ==========================================

let activeCourseFilter = "all";


function filterCourses(courseType) {

    if (courseType) {
        activeCourseFilter = courseType;
    }

    const searchTerm =
        document.getElementById("course-search").value.trim().toLowerCase();

    const courseCards = document.querySelectorAll(".course-card");
    let visibleCourses = 0;

    courseCards.forEach(card => {
        const courseName =
            card.querySelector("h3").textContent.toLowerCase();

        const courseTypeLabel = card.querySelector(".course-type");
        const cardCourseType = courseTypeLabel.classList.contains("core")
            ? "core"
            : "elective";

        const matchesSearch = courseName.includes(searchTerm);
        const matchesType =
            activeCourseFilter === "all" ||
            cardCourseType === activeCourseFilter;

        card.hidden = !(matchesSearch && matchesType);

        if (!card.hidden) {
            visibleCourses += 1;
        }
    });

    document.querySelectorAll(".course-filter").forEach(button => {
        const isActive = button.dataset.courseFilter === activeCourseFilter;
        button.setAttribute("aria-pressed", String(isActive));
    });

    document.getElementById("course-empty-state").hidden =
        visibleCourses > 0;
}


const MAX_CREDITS = 8;
const selectedCourses = [];


function getCourseCredits(courseName) {

    const courseCard = [...document.querySelectorAll(".course-card")].find(
        card => card.querySelector("h3").textContent.trim() === courseName
    );

    if (!courseCard) {
        return 0;
    }

    const creditLine = [...courseCard.querySelectorAll("p")].find(
        paragraph => paragraph.textContent.trim().startsWith("Credits:")
    );

    return creditLine
        ? Number(creditLine.textContent.replace("Credits:", "").trim()) || 0
        : 0;
}


function updateCreditSummary() {

    const selectedCreditTotal = selectedCourses.reduce(
        (total, courseName) => total + getCourseCredits(courseName),
        0
    );

    document.getElementById("selected-credits").textContent =
        String(selectedCreditTotal);
    document.getElementById("maximum-credits").textContent =
        String(MAX_CREDITS);
    document.getElementById("remaining-credits").textContent =
        String(Math.max(0, MAX_CREDITS - selectedCreditTotal));
}


function renderSelectedCourses() {

    const selectedCoursesList =
        document.getElementById("selected-courses-list");

    const selectedCourseCount =
        document.getElementById("selected-course-count");

    selectedCoursesList.innerHTML = "";

    if (selectedCourses.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-selection";
        emptyMessage.textContent = "No courses selected yet.";
        selectedCoursesList.appendChild(emptyMessage);
    } else {
        selectedCourses.forEach(courseName => {
            const courseItem = document.createElement("div");
            courseItem.className = "selected-course-item";
            courseItem.textContent = courseName;
            selectedCoursesList.appendChild(courseItem);
        });
    }

    selectedCourseCount.textContent =
        `${selectedCourses.length} selected`;

    updateCreditSummary();
    renderSchedule();
    document.getElementById("schedule-conflict-result").innerHTML = "";
    updateCourseSetOperations();
    displayExceptResults();
}


function selectCourse(courseName, button) {

    const courseIndex = selectedCourses.indexOf(courseName);
    const isSelected = courseIndex !== -1;

    if (isSelected) {
        selectedCourses.splice(courseIndex, 1);
    } else {
        const selectedCreditTotal = selectedCourses.reduce(
            (total, selectedCourse) => total + getCourseCredits(selectedCourse),
            0
        );
        const courseCredits = getCourseCredits(courseName);

        if (selectedCreditTotal + courseCredits > MAX_CREDITS) {
            const creditLimitMessage =
                document.getElementById("credit-limit-message");

            creditLimitMessage.textContent =
                `Cannot select ${courseName}: it would exceed the ${MAX_CREDITS}-credit limit. ` +
                `You have ${selectedCreditTotal} credits selected, and this course is worth ${courseCredits} credits.`;
            creditLimitMessage.hidden = false;
            return;
        }

        selectedCourses.push(courseName);
    }

    const creditLimitMessage =
        document.getElementById("credit-limit-message");
    creditLimitMessage.textContent = "";
    creditLimitMessage.hidden = true;

    button.textContent = isSelected ? "Select Course" : "Selected";
    button.setAttribute("aria-pressed", String(!isSelected));
    button.classList.toggle("is-selected", !isSelected);

    renderSelectedCourses();

}


// ==========================================
// VIEW NAVIGATION
// ==========================================

function showView(viewId) {
    document.querySelectorAll("main .view").forEach(view => {
        view.hidden = view.id !== viewId;
    });

    document.querySelectorAll(".nav-link").forEach(button => {
        const isActive = button.dataset.viewTarget === viewId;
        button.classList.toggle("is-active", isActive);
        if (isActive) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}


document.querySelectorAll("[data-view-target]").forEach(control => {
    control.addEventListener("click", event => {
        event.preventDefault();
        const viewId = control.dataset.viewTarget;
        showView(viewId);

        if (control instanceof HTMLAnchorElement) {
            const targetId = control.getAttribute("href").slice(1);
            if (targetId !== viewId) {
                document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
            }
        }
    });
});


document.querySelectorAll('input[name="recommendation-set"]').forEach(input => {
    input.addEventListener("change", updateCourseSetOperations);
});


// START APPLICATION
// ==========================================

displayRecommendations();
renderCompletedCourseOptions();
updateCreditSummary();
renderSchedule();
updateCourseSetOperations();
displayExceptResults();
filterCourses();
showView("dashboard");