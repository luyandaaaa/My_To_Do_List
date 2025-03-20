// script.js
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: new Date(),
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Today',
                start: new Date(),
                allDay: true,
                backgroundColor: '#ff9f89',
                textColor: '#000'
            }
        ]
    });
    calendar.render();

    // Task Management Logic
    const taskModal = document.getElementById('task-modal');
    const overlay = document.getElementById('overlay');
    const newTaskBtn = document.getElementById('new-task-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const plusIcons = document.querySelectorAll('.plus-icon');

    newTaskBtn.addEventListener('click', () => {
        taskModal.classList.add('active');
        overlay.classList.add('active');
    });

    plusIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const category = icon.closest('.category').dataset.category;
            document.getElementById('task-category').value = category;
            taskModal.classList.add('active');
            overlay.classList.add('active');
        });
    });

    cancelBtn.addEventListener('click', () => {
        taskModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskName = document.getElementById('task-name').value;
        const category = document.getElementById('task-category').value;
        const userId = 1; // Replace with the logged-in user's ID

        await createTask(category, { userId, name: taskName });

        taskModal.classList.remove('active');
        overlay.classList.remove('active');
        taskForm.reset();
    });

    async function createTask(category, taskData) {
        const response = await fetch(`/tasks/${category}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });
        const result = await response.json();
        if (response.ok) {
            fetchTasks(category);
        } else {
            console.error(result.error);
        }
    }

    async function fetchTasks(category) {
        const userId = 1;
        const response = await fetch(`/tasks/${userId}/${category}`);
        const tasks = await response.json();
        renderTasks(tasks);
    }

    function renderTasks(tasks) {
        taskList.innerHTML = tasks.map(task => `
            <li class="task" data-task-id="${task.id}">
                ${task.name} (${task.category || 'Uncategorized'})
                <button onclick="deleteTask('${task.category}', ${task.id})">Delete</button>
            </li>
        `).join('');
    }

    async function deleteTask(category, taskId) {
        const response = await fetch(`/tasks/${category}/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
            fetchTasks(category);
        } else {
            console.error('Failed to delete task');
        }
    }
});