document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Client-side validation
        if (!name || !email || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Prepare data to send to the server
        const data = { name, email, password, confirmPassword };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = '/home.html'; // Redirect to home page
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});

/* scriptfor home page*/
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
});

document.addEventListener('DOMContentLoaded', function () {
    const newTaskBtn = document.getElementById('new-task-btn');
    const overlay = document.getElementById('overlay');
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const plusIcons = document.querySelectorAll('.plus-icon'); // Select all plus icons

    // Function to open the modal
    function openModal() {
        overlay.style.display = 'block';
        taskModal.style.display = 'block';
    }

    // Open modal for "New Task" button
    newTaskBtn.addEventListener('click', openModal);

    // Open modal for plus icons
    plusIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const category = this.getAttribute('data-category'); // Get the category from the plus icon
            const categoryRadio = document.querySelector(`input[name="task-category"][value="${category}"]`);
            if (categoryRadio) {
                categoryRadio.checked = true; // Pre-select the category in the modal
            }
            openModal(); // Open the modal
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });

    // Prevent past dates
    const taskDate = document.getElementById('task-date');
    taskDate.min = new Date().toISOString().split('T')[0];

    // Handle form submission
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const taskCategory = document.querySelector('input[name="task-category"]:checked').value;
        const taskDate = document.getElementById('task-date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const taskDescription = document.getElementById('task-description').value;

        if (startTime >= endTime) {
            alert('End time must be after start time.');
            return;
        }

        const taskData = {
            name: taskName,
            category: taskCategory,
            date: taskDate,
            startTime: startTime,
            endTime: endTime,
            description: taskDescription
        };

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                alert('Task created successfully!');
                taskForm.reset();
                overlay.style.display = 'none';
                taskModal.style.display = 'none';
                // Optionally, refresh the task list or calendar
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
        
        // Clear form and close modal
        taskForm.reset();
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch the user's name from the server
    fetch('/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the greeting with the user's name
            const greetingElement = document.getElementById('user-greeting');
            if (greetingElement) {
                greetingElement.textContent = `What's up, ${data.name}!`;
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    // Rest of your existing JavaScript code...
});
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Client-side validation
        if (!email || !password) {
            alert('Email and password are required');
            return;
        }

        // Prepare data to send to the server
        const data = { email, password };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = '/home.html'; // Redirect to home page
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});

async function fetchTasks() {
    try {
        const response = await fetch('/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const tasks = await response.json();
        const taskList = document.getElementById('task-list');

        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="task-content">
                    <label class="task-checkbox">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               data-id="${task.id}" data-table="${task.table}">
                        <span class="checkmark"></span>
                    </label>
                    <span class="task-name ${task.completed ? 'strikethrough' : ''}">${task.name}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}" data-table="${task.table}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="delete-btn" data-id="${task.id}" data-table="${task.table}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });

        // Attach event listeners for toggling completion
        document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });

        // Attach event listeners for edit and delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTask);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', editTask);
        });
        updateTaskCounters();
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert('Failed to load tasks. Please try again.');
    }
}

// Function to toggle task completion
async function toggleTaskCompletion(event) {
    const checkbox = event.target;
    const taskId = checkbox.getAttribute('data-id');
    const table = checkbox.getAttribute('data-table');

    try {
        const response = await fetch(`/tasks/${table}/${taskId}/toggle`, { method: 'PATCH' });

        if (!response.ok) {
            throw new Error('Failed to toggle task');
        }

        const result = await response.json();
        
        if (result.success) {
            fetchTasks(); // Refresh the task list after completion
        }
    } catch (error) {
        console.error("Error toggling task:", error);
        alert('Failed to update task. Please try again.');
    }
}



async function deleteTask(event) {
    // Get the button element (might be the icon or the button itself)
    const button = event.target.closest('.delete-btn');
    if (!button) return;

    const id = button.dataset.id;
    const table = button.dataset.table;

    // Create a confirmation modal dynamically
    const modal = document.createElement('div');
    modal.classList.add('delete-modal');
    modal.innerHTML = `
        <div class="delete-modal-content">
            <span class="close-delete-modal">&times;</span>
            <p>Are you sure you want to delete this task?</p>
            <button id="confirm-delete">Delete</button>
            <button id="cancel-delete">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking the X button
    modal.querySelector('.close-delete-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Close modal when clicking Cancel
    modal.querySelector('#cancel-delete').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Handle confirm delete
    modal.querySelector('#confirm-delete').addEventListener('click', async () => {
        try {
            const response = await fetch(`/tasks/${table}/${id}`, { 
                method: 'DELETE' 
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            
            document.body.removeChild(modal);
            fetchTasks(); // Refresh tasks
        } catch (error) {
            console.error("Error deleting task:", error);
            document.body.removeChild(modal);
            alert('Failed to delete task. Please try again.');
        }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

async function editTask(event) {
    // Get the button element (might be the icon or the button itself)
    const button = event.target.closest('.edit-btn');
    if (!button) return;

    const id = button.dataset.id;
    const table = button.dataset.table;
    const newName = prompt("Enter new task name:");

    if (newName) {
        try {
            const response = await fetch(`/tasks/${table}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_name: newName })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update task');
            }
            
            fetchTasks(); // Refresh tasks
        } catch (error) {
            console.error("Error updating task:", error);
            alert('Failed to update task. Please try again.');
        }
    }
}

// Update task counters
function updateTaskCounters() {
    const activeTasks = document.querySelectorAll('#task-list li').length;
    const completedTasks = document.querySelectorAll('#completed-task-list li').length;
    
    document.getElementById('task-counter').textContent = activeTasks;
    document.getElementById('completed-counter').textContent = `(${completedTasks})`;
}

async function fetchCompletedTasks() {
    try {
        const response = await fetch('/completed-tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch completed tasks');
        }

        const tasks = await response.json();
        const completedTaskList = document.getElementById('completed-task-list');
        
        completedTaskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item completed';
            li.innerHTML = `
                <div class="task-content">
                    <span class="task-name strikethrough">${task.task_name}</span>
                </div>
                <div class="task-actions">
                    <small>Completed on: ${new Date(task.completed_at).toLocaleString()}</small>
                </div>
            `;
            completedTaskList.appendChild(li);
        });
        updateTaskCounters();
    } catch (error) {
        console.error("Error fetching completed tasks:", error);
    }
}

// Load completed tasks on page load
document.addEventListener('DOMContentLoaded', fetchCompletedTasks);

// Load tasks on page load
document.addEventListener('DOMContentLoaded', fetchTasks);
