// =============================
// Event Listeners
// =============================
document.addEventListener("keydown", (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
        deleteTasks();
    } else if (event.key === "Enter") {
        openPopUp();
    }
});

// =============================
// Global Task List
// =============================
let tasks = loadTasks();

// Initial render
renderTasks();


// =============================
// Task Rendering
// =============================
function renderTasks() {
    const ol = document.querySelector("ol");
    ol.innerHTML = "";

    tasks = loadTasks(); // always pull from storage

    tasks.forEach(task => {
        addTask(
            task.id,
            task.title,
            task.description,
            task.checked,
            task.createdAt,
            task.completedAt
        );
    });

    checkBoxes();
    initSortable();
}

var sortableInstance;

function initSortable() {
  const ol = document.getElementById("sortable-list");
  if (!ol) return;

  if (sortableInstance) sortableInstance.destroy();

  sortableInstance = new Sortable(ol, {
    animation: 150,
    ghostClass: "dragging",
    onEnd() {
      const ids = [...ol.querySelectorAll("li.task")].map(li => Number(li.id));
      const byId = new Map(tasks.map(t => [t.id, t]));
      tasks = ids.map(id => byId.get(id)).filter(Boolean);
      saveTask(tasks);
    }
  });
}

function addTask(id, title, description, checked, createdAt, completedAt) {
    const ol = document.querySelector("ol");

    
    const li = document.createElement("li");
    li.classList.add("task");
    li.setAttribute("draggable","true");
    li.id = id;
    if (checked) li.classList.add("checked");

    const details = document.createElement("details");


    const summary = document.createElement("summary");

    
    const span = document.createElement("span");
    span.textContent = title;
    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("task-controls");

    const label = document.createElement("label");
    label.classList.add("checkbox");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;

    const inputSpan = document.createElement("span");

    label.appendChild(input);
    label.appendChild(inputSpan);

    // Delete button (X SVG)
    const deleteBtn = document.createElement("span");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" 
             xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="4" y1="4" x2="20" y2="20" 
                  stroke="lawngreen" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="4" x2="4" y2="20" 
                  stroke="lawngreen" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    deleteBtn.addEventListener("click", () => deleteTask(id));

    controlsDiv.appendChild(label);
    controlsDiv.appendChild(deleteBtn);

    const pDesc = document.createElement("p");
    pDesc.classList.add("task-desc");
    pDesc.textContent = description;

    const pCreated = document.createElement("p");
    pCreated.classList.add("createdAt");
    pCreated.textContent = "Created at: " + createdAt;

    const pCompleted = document.createElement("p");
    pCompleted.classList.add("completedAt");
    pCompleted.textContent = completedAt ? "Completed at: " + completedAt : "";

    // Assemble
    summary.appendChild(span);
    summary.appendChild(controlsDiv);

    details.appendChild(summary);
    details.appendChild(pDesc);
    details.appendChild(pCreated);
    details.appendChild(pCompleted);

    li.appendChild(details);
    ol.appendChild(li);

}


// =============================
// Task CRUD
// =============================
function createTask() {
    const newTask = document.getElementById("new-task").value;
    const taskDesc = document.getElementById("task-desc").value;

    if (newTask && taskDesc) {
        tasks.push({
            id: Date.now(),
            title: newTask,
            description: taskDesc,
            checked: false,
            createdAt: new Date().toDateString(),
            completedAt: null
        });
        saveTask(tasks);
        renderTasks();
    } else {
        window.alert("Please enter the value!");
    }

    closePopUp();
}

function updateTask(id, updates) {
    id = parseInt(id, 10);
    let task = tasks.find(t => t.id === id);
    if (task) Object.assign(task, updates);
    saveTask(tasks);
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTask(tasks);
    renderTasks();
}

function deleteTasks() {
    // const confirmed = window.confirm("Are you sure you want to delete selected tasks?");
    
    // if (confirmed) {
    tasks = tasks.filter(t => !t.checked);
    saveTask(tasks);
    renderTasks();
    // }
}

function deleteAll() {
    // const confirmed = window.confirm("Are you sure you want to delete all tasks?");
    
    // if (confirmed) {
        tasks = [];           
        saveTask(tasks);      
        renderTasks();        
    // }
}


// =============================
// Task Checking
// =============================
function checkTask(checkbox, liHTML, taskText) {
    const liId = liHTML.id;

    if (checkbox.checked) {
        liHTML.classList.add("checked");

        const dateCompleted = new Date().toDateString();
        updateTask(liId, { checked: true, completedAt: dateCompleted });

        taskText.style.textDecoration = "line-through";
        taskText.style.color = "gray";
    } else {
        liHTML.classList.remove("checked");

        updateTask(liId, { checked: false, completedAt: null });

        taskText.style.textDecoration = "none";
        taskText.style.color = "";
    }
}

function checkBoxes() {
    const checkboxes = document.querySelectorAll(".checkbox input[type='checkbox']");

    checkboxes.forEach(checkbox => {
        const summary = checkbox.closest("summary");
        const liHTML = checkbox.closest("li");
        const taskText = summary.querySelector("span");

        checkTask(checkbox, liHTML, taskText);

        checkbox.addEventListener("change", () => {
            checkTask(checkbox, liHTML, taskText);
        });
    });
}


// =============================
// Pop-up Controls
// =============================
function closePopUp() {
    document.querySelector(".blanker").style.display = "none";
}

function openPopUp() {
    document.querySelector(".blanker").style.display = "flex";
}


// =============================
// LocalStorage CRUD
// =============================
function saveTask(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    let data = localStorage.getItem("tasks");
    return data ? JSON.parse(data) : [];
}

function showCustomMenu(e) {
    const menu = document.getElementById("custom-menu");
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
    menu.style.display = "block";
}

document.addEventListener("click", function() {
    document.getElementById("custom-menu").style.display = "none";
});

document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    showCustomMenu(e);
});


