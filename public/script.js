// Login Form Handling
document.addEventListener('DOMContentLoaded', () => {
    // Set viewport meta tag dynamically if not present
    if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
    }

    // Handle window resize
    function handleResize() {
        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            if (window.innerWidth < 768) {
                calendarEl.style.height = '300px';
            } else {
                calendarEl.style.height = '400px';
            }
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    // Touch device detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Add touch class to body if touch device
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }

    // Login Form Handling
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

    // Home Page Functionality
    if (document.getElementById('user-greeting')) {
        // Global user data cache
        let userData = null;

        // Add plus icons to category cards
        function addPlusIconsToCategories() {
            const categories = document.querySelectorAll('.category');
            categories.forEach(category => {
                const plusIcon = document.createElement('div');
                plusIcon.className = 'plus-icon';
                plusIcon.innerHTML = '<i class="fas fa-plus"></i>';
                plusIcon.dataset.category = category.dataset.category;
                category.appendChild(plusIcon);
                
                // Add both click and touch events
                plusIcon.addEventListener('click', handlePlusIconClick);
                if (isTouchDevice) {
                    plusIcon.addEventListener('touchend', handlePlusIconClick);
                }
            });
        }

        function handlePlusIconClick(e) {
            e.preventDefault();
            const category = this.dataset.category;
            document.querySelector(`input[name="task-category"][value="${category}"]`).checked = true;
            document.getElementById('modal-title').textContent = 'Create New Task';
            showModal(taskModal);
        }

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
                    updateProfileModal(data);
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
                greetingElement.textContent = `What's up, ${data.name.split(' ')[0]}!`;
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
                    backgroundColor: '#e86100',
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
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        function hideModals() {
            if (overlay) overlay.style.display = 'none';
            if (taskModal) taskModal.style.display = 'none';
            if (profileModal) profileModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Task Modal Functionality
        const newTaskBtn = document.getElementById('new-task-btn');
        const closeModal = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');

        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => {
                document.getElementById('modal-title').textContent = 'Create New Task';
                showModal(taskModal);
            });
            if (isTouchDevice) {
                newTaskBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    document.getElementById('modal-title').textContent = 'Create New Task';
                    showModal(taskModal);
                });
            }
        }

        if (closeModal) {
            closeModal.addEventListener('click', hideModals);
            if (isTouchDevice) {
                closeModal.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    hideModals();
                });
            }
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideModals);
            if (isTouchDevice) {
                cancelBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    hideModals();
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', hideModals);
            if (isTouchDevice) {
                overlay.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    hideModals();
                });
            }
        }

        // Task Form Submission
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            const taskDate = document.getElementById('task-date');
            if (taskDate) taskDate.min = new Date().toISOString().split('T')[0];

            // Initialize default form handler for creating tasks
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

        function updateProfileModal(data) {
            if (profileName) profileName.textContent = data.name;
            if (profileEmail) profileEmail.textContent = data.email || 'Not available';
        }

        if (userIcon) {
            userIcon.addEventListener('click', function() {
                if (userData) {
                    updateProfileModal(userData);
                } else {
                    fetchUserData().then(updateProfileModal);
                }
                showModal(profileModal);
            });
            
            if (isTouchDevice) {
                userIcon.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    if (userData) {
                        updateProfileModal(userData);
                    } else {
                        fetchUserData().then(updateProfileModal);
                    }
                    showModal(profileModal);
                });
            }
        }

        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', hideModals);
            if (isTouchDevice) {
                closeProfileModal.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    hideModals();
                });
            }
        }

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
            
            if (isTouchDevice) {
                logoutBtn.addEventListener('touchend', function(e) {
                    e.preventDefault();
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
        }

        // Task Management Functions
        async function fetchTasks() {
            try {
                const response = await fetch('/tasks');
                if (!response.ok) throw new Error('Failed to fetch tasks');
                
                const tasks = await response.json();
                const taskList = document.getElementById('task-list');
                if (!taskList) return;

                taskList.innerHTML = '';
                
                // Combine all tasks from different categories
                const allTasks = [
                    ...tasks.work.map(t => ({ ...t, category: 'work' })),
                    ...tasks.personal.map(t => ({ ...t, category: 'personal' })),
                    ...tasks.shopping.map(t => ({ ...t, category: 'shopping' })),
                    ...tasks.health.map(t => ({ ...t, category: 'health' }))
                ];
                
                // Sort by date and time
                allTasks.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.startTime}`);
                    const dateB = new Date(`${b.date}T${b.startTime}`);
                    return dateA - dateB;
                });
                
                allTasks.forEach(task => {
                    const li = document.createElement('li');
                    li.className = `task-item ${task.completed ? 'completed' : ''}`;
                    li.innerHTML = `
                        <div class="task-content">
                            <label class="task-checkbox">
                                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                       data-id="${task.id}" data-category="${task.category}">
                                <span class="checkmark"></span>
                            </label>
                            <div class="task-details">
                                <div class="task-name ${task.completed ? 'strikethrough' : ''}">${task.name}</div>
                                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                                <div class="task-meta">
                                    <div class="task-date">${formatDate(task.date)}</div>
                                    <div class="task-time">${formatTime(task.startTime)} - ${formatTime(task.endTime)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="edit-btn" data-id="${task.id}" data-category="${task.category}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${task.id}" data-category="${task.category}">
                                <i class="fas fa-trash"></i>
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

        function formatDate(dateString) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }

        function formatTime(timeString) {
            if (!timeString) return '';
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        }

        function attachTaskEventListeners() {
            document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
                checkbox.addEventListener('change', toggleTaskCompletion);
                if (isTouchDevice) {
                    checkbox.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        checkbox.checked = !checkbox.checked;
                        const event = new Event('change');
                        checkbox.dispatchEvent(event);
                    });
                }
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', deleteTask);
                if (isTouchDevice) {
                    button.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        deleteTask(e);
                    });
                }
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', editTask);
                if (isTouchDevice) {
                    button.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        editTask(e);
                    });
                }
            });
        }

        async function toggleTaskCompletion(event) {
            const checkbox = event.target;
            const taskId = checkbox.getAttribute('data-id');
            const category = checkbox.getAttribute('data-category');

            try {
                const response = await fetch(`/tasks/${category}/${taskId}/toggle`, { 
                    method: 'PATCH' 
                });

                if (!response.ok) throw new Error('Failed to toggle task');
                
                const result = await response.json();
                if (result.success) {
                    fetchTasks();
                    fetchCompletedTasks();
                }
            } catch (error) {
                console.error("Error toggling task:", error);
                alert('Failed to update task. Please try again.');
            }
        }

        async function deleteTask(event) {
            const button = event.target.closest('.delete-btn');
            if (!button) return;

            const id = button.dataset.id;
            const category = button.dataset.category;

            // Show confirmation modal instead of native confirm
            const deleteModal = document.createElement('div');
            deleteModal.className = 'delete-modal';
            deleteModal.innerHTML = `
                <button class="close-delete-modal">&times;</button>
                <div class="delete-modal-content">
                    <p>Are you sure you want to delete this task?</p>
                    <div>
                        <button id="confirm-delete">Delete</button>
                        <button id="cancel-delete">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(deleteModal);

            // Handle modal close
            const closeBtn = deleteModal.querySelector('.close-delete-modal');
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(deleteModal);
            });

            // Handle cancel
            const cancelBtn = deleteModal.querySelector('#cancel-delete');
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(deleteModal);
            });

            // Handle confirm
            const confirmBtn = deleteModal.querySelector('#confirm-delete');
            confirmBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch(`/tasks/${category}/${id}`, { 
                        method: 'DELETE' 
                    });
                    
                    if (!response.ok) throw new Error('Failed to delete task');
                    
                    document.body.removeChild(deleteModal);
                    fetchTasks();
                } catch (error) {
                    console.error("Error deleting task:", error);
                    alert('Failed to delete task. Please try again.');
                    document.body.removeChild(deleteModal);
                }
            });

            // Add touch events for mobile
            if (isTouchDevice) {
                closeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    document.body.removeChild(deleteModal);
                });

                cancelBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    document.body.removeChild(deleteModal);
                });

                confirmBtn.addEventListener('touchend', async (e) => {
                    e.preventDefault();
                    try {
                        const response = await fetch(`/tasks/${category}/${id}`, { 
                            method: 'DELETE' 
                        });
                        
                        if (!response.ok) throw new Error('Failed to delete task');
                        
                        document.body.removeChild(deleteModal);
                        fetchTasks();
                    } catch (error) {
                        console.error("Error deleting task:", error);
                        alert('Failed to delete task. Please try again.');
                        document.body.removeChild(deleteModal);
                    }
                });
            }
        }

        async function editTask(event) {
            const button = event.target.closest('.edit-btn');
            if (!button) return;

            const id = button.dataset.id;
            const originalCategory = button.dataset.category;
            
            try {
                const response = await fetch('/tasks');
                if (!response.ok) throw new Error('Failed to fetch tasks');
                
                const tasks = await response.json();
                const categoryTasks = tasks[originalCategory] || [];
                const task = categoryTasks.find(t => t.id === id);
                
                if (!task) {
                    alert('Task not found');
                    return;
                }

                // Fill the form with task data
                document.getElementById('task-name').value = task.name;
                document.getElementById('task-date').value = task.date;
                document.getElementById('start-time').value = task.startTime;
                document.getElementById('end-time').value = task.endTime;
                document.getElementById('task-description').value = task.description || '';
                document.querySelector(`input[name="task-category"][value="${originalCategory}"]`).checked = true;
                
                document.getElementById('modal-title').textContent = 'Edit Task';
                showModal(taskModal);
                
                // Clone the form to remove all existing event listeners
                const newForm = taskForm.cloneNode(true);
                taskForm.parentNode.replaceChild(newForm, taskForm);
                
                // Add submit handler for the edit
                newForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const updatedTask = {
                        name: document.getElementById('task-name').value,
                        date: document.getElementById('task-date').value,
                        startTime: document.getElementById('start-time').value,
                        endTime: document.getElementById('end-time').value,
                        description: document.getElementById('task-description').value
                    };

                    if (updatedTask.startTime >= updatedTask.endTime) {
                        alert('End time must be after start time.');
                        return;
                    }

                    try {
                        const response = await fetch(`/tasks/${originalCategory}/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedTask)
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Failed to update task');
                        }
                        
                        newForm.reset();
                        hideModals();
                        fetchTasks();
                    } catch (error) {
                        console.error("Error updating task:", error);
                        alert(error.message || 'Failed to update task. Please try again.');
                    }
                });
            } catch (error) {
                console.error("Error fetching task:", error);
                alert('Failed to load task. Please try again.');
            }
        }

        function updateTaskCounters() {
            const activeTasks = document.querySelectorAll('#task-list li:not(.completed)').length;
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
                    li.className = 'completed-task';
                    li.innerHTML = `
                        <div class="task-info">
                            <span class="task-name">${task.name}</span>
                            <span class="task-date">Completed: ${new Date(task.completedAt).toLocaleString()}</span>
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

            // Count tasks in each category
            categoryCounts.work = tasks.work?.length || 0;
            categoryCounts.personal = tasks.personal?.length || 0;
            categoryCounts.shopping = tasks.shopping?.length || 0;
            categoryCounts.health = tasks.health?.length || 0;

            Object.keys(categoryCounts).forEach(category => {
                const countElement = document.querySelector(`.category.${category} .count-number`);
                const taskTextElement = document.querySelector(`.category.${category} .task-count`);
                
                if (countElement) {
                    const count = categoryCounts[category];
                    countElement.textContent = count;
                    
                    if (taskTextElement) {
                        const textNodes = Array.from(taskTextElement.childNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
                        
                        if (textNodes.length > 0) {
                            textNodes[0].textContent = count === 1 ? ' task' : ' tasks';
                        }
                    }
                }
            });
        }

        // Initial Data Loading
        addPlusIconsToCategories();
        fetchUserData();
        fetchTasks();
        fetchCompletedTasks();
    }
});