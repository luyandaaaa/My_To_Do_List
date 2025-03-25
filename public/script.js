// Login Form Handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Email and password are required');
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    window.location.href = '/home.html';
                } else {
                    const result = await response.json();
                    alert(result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // Signup Form Handling
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!name || !email || !password || !confirmPassword) {
                alert('All fields are required');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, confirmPassword })
                });

                if (response.ok) {
                    window.location.href = '/home.html';
                } else {
                    const result = await response.json();
                    alert(result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
});

// Home Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Global user data cache
    let userData = null;

    // Fetch and cache user data
    function fetchUserData() {
        return fetch('/user')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                userData = data;
                updateUserGreeting(data);
                return data;
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                throw error;
            });
    }

    // Update greeting with user's name
    function updateUserGreeting(data) {
        const greetingElement = document.getElementById('user-greeting');
        if (greetingElement) {
            greetingElement.textContent = `What's up, ${data.name}!`;
        }
    }

    // Initialize Calendar
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            initialDate: new Date(),
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [{
                title: 'Today',
                start: new Date(),
                allDay: true,
                backgroundColor: '#ff9f89',
                textColor: '#000'
            }]
        });
        calendar.render();
    }

    // Modal Management
    const overlay = document.getElementById('overlay');
    const taskModal = document.getElementById('task-modal');
    const profileModal = document.getElementById('profile-modal');

    function showModal(modal) {
        if (overlay) overlay.style.display = 'block';
        if (modal) modal.style.display = 'block';
    }

    function hideModals() {
        if (overlay) overlay.style.display = 'none';
        if (taskModal) taskModal.style.display = 'none';
        if (profileModal) profileModal.style.display = 'none';
    }

    // Task Modal Functionality
    const newTaskBtn = document.getElementById('new-task-btn');
    const closeModal = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const plusIcons = document.querySelectorAll('.plus-icon');

    if (newTaskBtn) newTaskBtn.addEventListener('click', () => showModal(taskModal));

    plusIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const categoryRadio = document.querySelector(`input[name="task-category"][value="${category}"]`);
            if (categoryRadio) categoryRadio.checked = true;
            showModal(taskModal);
        });
    });

    if (closeModal) closeModal.addEventListener('click', hideModals);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModals);
    if (overlay) overlay.addEventListener('click', hideModals);

    // Task Form Submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        const taskDate = document.getElementById('task-date');
        if (taskDate) taskDate.min = new Date().toISOString().split('T')[0];

        taskForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const taskData = {
                name: document.getElementById('task-name').value,
                category: document.querySelector('input[name="task-category"]:checked').value,
                date: document.getElementById('task-date').value,
                startTime: document.getElementById('start-time').value,
                endTime: document.getElementById('end-time').value,
                description: document.getElementById('task-description').value
            };

            if (taskData.startTime >= taskData.endTime) {
                alert('End time must be after start time.');
                return;
            }

            try {
                const response = await fetch('/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });

                if (response.ok) {
                    alert('Task created successfully!');
                    taskForm.reset();
                    hideModals();
                    fetchTasks();
                } else {
                    const result = await response.json();
                    alert(result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // Profile Modal Functionality
    const closeProfileModal = document.getElementById('close-profile-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const userIcon = document.getElementById('user-icon');

    if (userIcon) {
        userIcon.addEventListener('click', function() {
            if (userData) {
                updateProfileModal(userData);
            } else {
                fetchUserData().then(updateProfileModal);
            }
        });
    }

    function updateProfileModal(data) {
        if (profileName) profileName.textContent = data.name;
        if (profileEmail) profileEmail.textContent = data.email || 'Not available';
        showModal(profileModal);
    }

    if (closeProfileModal) closeProfileModal.addEventListener('click', hideModals);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            fetch('/logout', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        alert('Logout failed');
                    }
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    alert('Logout failed');
                });
        });
    }

    // Initial Data Loading
    if (document.getElementById('user-greeting')) {
        fetchUserData();
        fetchTasks();
        fetchCompletedTasks();
    }
});

// Task Management Functions
async function fetchTasks() {
    try {
        const response = await fetch('/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await response.json();
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

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

        updateCategoryTaskCounts(tasks);
        attachTaskEventListeners();
        updateTaskCounters();
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert('Failed to load tasks. Please try again.');
    }
}

function attachTaskEventListeners() {
    document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTaskCompletion);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteTask);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', editTask);
    });
}

async function toggleTaskCompletion(event) {
    const checkbox = event.target;
    const taskId = checkbox.getAttribute('data-id');
    const table = checkbox.getAttribute('data-table');

    try {
        const response = await fetch(`/tasks/${table}/${taskId}/toggle`, { 
            method: 'PATCH' 
        });

        if (!response.ok) throw new Error('Failed to toggle task');
        
        const result = await response.json();
        if (result.success) fetchTasks();
    } catch (error) {
        console.error("Error toggling task:", error);
        alert('Failed to update task. Please try again.');
    }
}

async function deleteTask(event) {
    const button = event.target.closest('.delete-btn');
    if (!button) return;

    const id = button.dataset.id;
    const table = button.dataset.table;

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

    modal.querySelector('.close-delete-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#cancel-delete').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#confirm-delete').addEventListener('click', async () => {
        try {
            const response = await fetch(`/tasks/${table}/${id}`, { 
                method: 'DELETE' 
            });
            
            if (!response.ok) throw new Error('Failed to delete task');
            
            document.body.removeChild(modal);
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
            document.body.removeChild(modal);
            alert('Failed to delete task. Please try again.');
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

async function editTask(event) {
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
            
            if (!response.ok) throw new Error('Failed to update task');
            
            fetchTasks();
        } catch (error) {
            console.error("Error updating task:", error);
            alert('Failed to update task. Please try again.');
        }
    }
}

function updateTaskCounters() {
    const activeTasks = document.querySelectorAll('#task-list li').length;
    const completedTasks = document.querySelectorAll('#completed-task-list li').length;
    
    const taskCounter = document.getElementById('task-counter');
    const completedCounter = document.getElementById('completed-counter');
    
    if (taskCounter) taskCounter.textContent = activeTasks;
    if (completedCounter) completedCounter.textContent = `(${completedTasks})`;
}

async function fetchCompletedTasks() {
    try {
        const response = await fetch('/completed-tasks');
        if (!response.ok) throw new Error('Failed to fetch completed tasks');

        const tasks = await response.json();
        const completedTaskList = document.getElementById('completed-task-list');
        if (!completedTaskList) return;
        
        completedTaskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="task-content">
                    <span class="task-checkbox">
                        <input type="checkbox" checked disabled>
                        <span class="checkmark" style="background-color: #2ecc71"></span>
                    </span>
                    <span class="task-name">${task.task_name}</span>
                </div>
                <div class="task-actions">
                    <small>Completed: ${new Date(task.completed_at).toLocaleDateString()}</small>
                </div>
            `;
            completedTaskList.appendChild(li);
        });
        updateTaskCounters();
    } catch (error) {
        console.error("Error fetching completed tasks:", error);
    }
}

function updateCategoryTaskCounts(tasks) {
    const categoryCounts = { work: 0, personal: 0, shopping: 0, health: 0 };

    tasks.forEach(task => {
        if (task.category && categoryCounts.hasOwnProperty(task.category)) {
            categoryCounts[task.category]++;
        }
    });

    Object.keys(categoryCounts).forEach(category => {
        const countElement = document.querySelector(`.category.${category} .count-number`);
        const taskTextElement = document.querySelector(`.category.${category} .task-count`);
        
        if (countElement && taskTextElement) {
            const count = categoryCounts[category];
            countElement.textContent = count;
            
            const textNodes = Array.from(taskTextElement.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
            
            if (textNodes.length > 0) {
                textNodes[0].textContent = count === 1 ? ' task' : ' tasks';
            } else {
                const textNode = document.createTextNode(count === 1 ? ' task' : ' tasks');
                taskTextElement.appendChild(textNode);
            }
        }
    });
}