// Global variables
let jobPositionsData = {};
let currentPosition = null;
let filteredData = [];

// DOM Elements
const positionSelect = document.getElementById('positionSelect');
const loadingIndicator = document.getElementById('loadingIndicator');
const noPositionSelected = document.getElementById('noPositionSelected');
const mainContent = document.getElementById('mainContent');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadData();
    loadSettings();
});

// Load data from JSON file
async function loadData() {
    showLoading(true);
    try {
        const response = await fetch('job-positions.json');
        const data = await response.json();
        jobPositionsData = data;
        
        populatePositionSelector();
        updateOverallStats();
        showLoading(false);
        
        // Auto-select first position if available
        if (data.positions && data.positions.length > 0) {
            selectPosition(data.positions[0].id);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        loadFallbackData();
    }
}

// Fallback data structure
function loadFallbackData() {
    jobPositionsData = {
        "version": "1.0",
        "lastUpdated": "2025-06-12",
        "positions": [
            {
                "id": "oracle-dba",
                "title": "Oracle Database Administrator",
                "description": "Professional responsible for managing, maintaining, and optimizing Oracle Database systems",
                "department": "IT Infrastructure",
                "level": "Senior",
                "categories": [
                    {
                        "name": "Database Installation & Configuration",
                        "description": "Installation and setup of Oracle Database software and environments",
                        "icon": "🔧",
                        "responsibilities": [
                            "ติดตั้งและกำหนดค่า Oracle Database Software",
                            "สร้างและกำหนดค่า Database Instance",
                            "ติดตั้งและกำหนดค่า Oracle Grid Infrastructure",
                            "กำหนดค่า Oracle Net Services",
                            "ติดตั้งและกำหนดค่า Oracle Clusterware",
                            "กำหนดค่า Memory Management (SGA/PGA)"
                        ]
                    },
                    {
                        "name": "Performance Tuning & Optimization",
                        "description": "Analyze and optimize database performance",
                        "icon": "📊",
                        "responsibilities": [
                            "วิเคราะห์และปรับปรุง SQL Performance",
                            "ติดตามและวิเคราะห์ AWR Reports",
                            "ปรับปรุง Database Parameters",
                            "จัดการ Table Statistics และ Histograms",
                            "ปรับปรุง Index Design และ Partitioning",
                            "วิเคราะห์และปรับปรุง Wait Events"
                        ]
                    },
                    {
                        "name": "Security Management",
                        "description": "Implement and maintain database security",
                        "icon": "🔒",
                        "responsibilities": [
                            "จัดการ User Accounts และ Privileges",
                            "กำหนดค่า Database Security Policies",
                            "ติดตั้งและจัดการ SSL/TLS Encryption",
                            "กำหนดค่า Database Auditing",
                            "จัดการ Password Policies และ Profiles",
                            "ติดตั้งและจัดการ Oracle Advanced Security"
                        ]
                    }
                ],
                "scorecard": [
                    { "category": "Database Installation & Configuration", "task": "ติดตั้ง Oracle Database Software", "difficulty": 3, "frequency": "รายปี", "note": "Enterprise/Standard Edition" },
                    { "category": "Database Installation & Configuration", "task": "สร้าง Database Instance ใหม่", "difficulty": 4, "frequency": "รายเดือน", "note": "DBCA หรือ Manual Script" },
                    { "category": "Performance Tuning & Optimization", "task": "วิเคราะห์ AWR Reports", "difficulty": 4, "frequency": "รายวัน", "note": "Automatic Workload Repository" },
                    { "category": "Performance Tuning & Optimization", "task": "ปรับปรุง SQL Statement Performance", "difficulty": 5, "frequency": "รายวัน", "note": "Query Optimization" },
                    { "category": "Security Management", "task": "จัดการ Database User Accounts", "difficulty": 2, "frequency": "รายวัน", "note": "Create, Modify, Drop Users" },
                    { "category": "Security Management", "task": "กำหนด User Roles และ Privileges", "difficulty": 3, "frequency": "รายวัน", "note": "Least Privilege Principle" }
                ]
            }
        ]
    };
    
    populatePositionSelector();
    updateOverallStats();
    showLoading(false);
}

// Show/hide loading indicator
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
    noPositionSelected.style.display = show ? 'none' : (currentPosition ? 'none' : 'block');
    mainContent.style.display = show ? 'none' : (currentPosition ? 'block' : 'none');
}

// Populate position selector dropdown
function populatePositionSelector() {
    positionSelect.innerHTML = '<option value="">กรุณาเลือกตำแหน่ง...</option>';
    
    if (jobPositionsData.positions) {
        jobPositionsData.positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.id;
            option.textContent = `${position.title} (${position.department || 'General'})`;
            positionSelect.appendChild(option);
        });
    }
    
    // Populate compare dropdowns
    populateCompareDropdowns();
}

// Populate compare modal dropdowns
function populateCompareDropdowns() {
    const compare1 = document.getElementById('comparePosition1');
    const compare2 = document.getElementById('comparePosition2');
    
    [compare1, compare2].forEach(select => {
        select.innerHTML = '<option value="">เลือกตำแหน่ง...</option>';
        if (jobPositionsData.positions) {
            jobPositionsData.positions.forEach(position => {
                const option = document.createElement('option');
                option.value = position.id;
                option.textContent = position.title;
                select.appendChild(option);
            });
        }
    });
}

// Update overall statistics
function updateOverallStats() {
    const totalPositions = jobPositionsData.positions?.length || 0;
    const totalCategories = jobPositionsData.positions?.reduce((sum, pos) => sum + (pos.categories?.length || 0), 0) || 0;
    const totalTasks = jobPositionsData.positions?.reduce((sum, pos) => sum + (pos.scorecard?.length || 0), 0) || 0;
    
    document.getElementById('totalPositions').textContent = totalPositions;
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalAllTasks').textContent = totalTasks;
}

// Select and display position
function selectPosition(positionId) {
    if (!positionId) {
        currentPosition = null;
        showNoPosition();
        return;
    }
    
    currentPosition = jobPositionsData.positions?.find(pos => pos.id === positionId);
    if (currentPosition) {
        positionSelect.value = positionId;
        displayPosition(currentPosition);
        showMainContent();
    }
}

// Show no position selected state
function showNoPosition() {
    mainContent.style.display = 'none';
    noPositionSelected.style.display = 'block';
}

// Show main content
function showMainContent() {
    noPositionSelected.style.display = 'none';
    mainContent.style.display = 'block';
}

// Display selected position
function displayPosition(position) {
    // Update position info header
    document.getElementById('currentPositionTitle').textContent = position.title;
    document.getElementById('currentPositionDescription').textContent = position.description || '-';
    document.getElementById('positionCategories').textContent = position.categories?.length || 0;
    document.getElementById('positionTotalTasks').textContent = position.scorecard?.length || 0;
    
    const avgDifficulty = position.scorecard?.length ? 
        (position.scorecard.reduce((sum, task) => sum + task.difficulty, 0) / position.scorecard.length).toFixed(1) : '0.0';
    document.getElementById('positionAvgDifficulty').textContent = avgDifficulty;
    
    // Display responsibilities
    displayResponsibilities(position.categories || []);
    
    // Initialize filters and display scorecard
    initializeFilters(position.scorecard || []);
    filteredData = [...(position.scorecard || [])];
    renderTable(filteredData);
    updateStats(filteredData);
}

// Display responsibilities
function displayResponsibilities(categories) {
    const container = document.getElementById('responsibilitiesContainer');
    container.innerHTML = '';
    
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'responsibility-category';
        
        categoryDiv.innerHTML = `
            <h3>${category.icon || '📋'} ${category.name}</h3>
            <ul>
                ${category.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        `;
        
        container.appendChild(categoryDiv);
    });
}

// Initialize filter dropdowns
function initializeFilters(scorecard) {
    const categories = [...new Set(scorecard.map(item => item.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    
    categoryFilter.innerHTML = '<option value="">ทั้งหมด</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Render scorecard table
function renderTable(data) {
    const tbody = document.getElementById('scorecardTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        
        const difficultyClass = `difficulty-${item.difficulty}`;
        const frequencyClass = `frequency-${item.frequency.replace('ราย', '')}`;
        
        row.innerHTML = `
            <td><strong>${item.category}</strong></td>
            <td>${item.task}</td>
            <td><span class="difficulty-badge ${difficultyClass}">${item.difficulty}</span></td>
            <td><span class="${frequencyClass}">${item.frequency}</span></td>
            <td><em>${item.note}</em></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStats(data) {
    document.getElementById('totalTasks').textContent = data.length;
    
    const avgDifficulty = data.length > 0 ? 
        (data.reduce((sum, item) => sum + item.difficulty, 0) / data.length).toFixed(1) : '0.0';
    document.getElementById('avgDifficulty').textContent = avgDifficulty;
    
    const dailyTasks = data.filter(item => item.frequency === 'รายวัน').length;
    document.getElementById('dailyTasks').textContent = dailyTasks;
    
    const criticalTasks = data.filter(item => item.difficulty === 5).length;
    document.getElementById('criticalTasks').textContent = criticalTasks;
}

// Apply filters
function applyFilters() {
    if (!currentPosition || !currentPosition.scorecard) return;
    
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const frequencyFilter = document.getElementById('frequencyFilter').value;

    filteredData = currentPosition.scorecard.filter(item => {
        const matchesSearch = item.task.toLowerCase().includes(searchTerm) || 
                            item.category.toLowerCase().includes(searchTerm) ||
                            item.note.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesDifficulty = !difficultyFilter || item.difficulty.toString() === difficultyFilter;
        const matchesFrequency = !frequencyFilter || item.frequency === frequencyFilter;

        return matchesSearch && matchesCategory && matchesDifficulty && matchesFrequency;
    });

    renderTable(filteredData);
    updateStats(filteredData);
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchBox').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('difficultyFilter').value = '';
    document.getElementById('frequencyFilter').value = '';
    applyFilters();
}

// Export functionality
function exportData() {
    const dataStr = JSON.stringify(jobPositionsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `job-positions-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import functionality
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            jobPositionsData = importedData;
            
            populatePositionSelector();
            updateOverallStats();
            
            // Reset current position
            currentPosition = null;
            showNoPosition();
            
            alert('ข้อมูลได้รับการนำเข้าเรียบร้อยแล้ว!');
        } catch (error) {
            alert('ไม่สามารถอ่านไฟล์ JSON ได้: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Comparison functionality
function runComparison() {
    const pos1Id = document.getElementById('comparePosition1').value;
    const pos2Id = document.getElementById('comparePosition2').value;
    
    if (!pos1Id || !pos2Id) {
        alert('กรุณาเลือกตำแหน่งทั้งสองตำแหน่ง');
        return;
    }
    
    if (pos1Id === pos2Id) {
        alert('กรุณาเลือกตำแหน่งที่แตกต่างกัน');
        return;
    }
    
    const position1 = jobPositionsData.positions.find(pos => pos.id === pos1Id);
    const position2 = jobPositionsData.positions.find(pos => pos.id === pos2Id);
    
    displayComparison(position1, position2);
}

// Display comparison results
function displayComparison(pos1, pos2) {
    const resultsContainer = document.getElementById('comparisonResults');
    
    const pos1Stats = calculatePositionStats(pos1);
    const pos2Stats = calculatePositionStats(pos2);
    
    resultsContainer.innerHTML = `
        <div class="comparison-table">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left;">เกณฑ์การเปรียบเทียบ</th>
                        <th style="padding: 12px; text-align: center;">${pos1.title}</th>
                        <th style="padding: 12px; text-align: center;">${pos2.title}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">หมวดงานทั้งหมด</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos1Stats.totalCategories}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos2Stats.totalCategories}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">งานทั้งหมด</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos1Stats.totalTasks}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos2Stats.totalTasks}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">ค่าเฉลี่ยความยาก</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos1Stats.avgDifficulty}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos2Stats.avgDifficulty}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">งานรายวัน</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos1Stats.dailyTasks}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos2Stats.dailyTasks}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">งานระดับสูง (4-5)</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos1Stats.expertTasks}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${pos2Stats.expertTasks}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Calculate position statistics
function calculatePositionStats(position) {
    const scorecard = position.scorecard || [];
    const totalTasks = scorecard.length;
    const totalCategories = position.categories?.length || 0;
    const avgDifficulty = totalTasks > 0 ? 
        (scorecard.reduce((sum, task) => sum + task.difficulty, 0) / totalTasks).toFixed(1) : '0.0';
    const dailyTasks = scorecard.filter(task => task.frequency === 'รายวัน').length;
    const expertTasks = scorecard.filter(task => task.difficulty >= 4).length;
    
    return {
        totalTasks,
        totalCategories,
        avgDifficulty,
        dailyTasks,
        expertTasks
    };
}

// Settings management
function loadSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const autoRefresh = localStorage.getItem('autoRefresh') !== 'false';
    
    document.getElementById('darkModeToggle').checked = darkMode;
    document.getElementById('autoRefreshToggle').checked = autoRefresh;
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function saveSettings() {
    const darkMode = document.getElementById('darkModeToggle').checked;
    const autoRefresh = document.getElementById('autoRefreshToggle').checked;
    
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('autoRefresh', autoRefresh);
    
    document.body.classList.toggle('dark-mode', darkMode);
}

// Event listeners setup
function setupEventListeners() {
    // Position selector
    positionSelect.addEventListener('change', (e) => {
        selectPosition(e.target.value);
    });
    
    // Filters
    document.getElementById('searchBox').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);
    document.getElementById('frequencyFilter').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Action buttons
    document.getElementById('compareBtn').addEventListener('click', () => {
        document.getElementById('compareModal').style.display = 'block';
    });
    
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'block';
    });
    
    // Modal controls
    document.getElementById('closeCompareModal').addEventListener('click', () => {
        document.getElementById('compareModal').style.display = 'none';
    });
    
    document.getElementById('closeSettingsModal').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
    });
    
    document.getElementById('runComparison').addEventListener('click', runComparison);
    
    // Settings
    document.getElementById('jsonFileInput').addEventListener('change', importData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('jsonFileInput').click();
    });
    
    document.getElementById('downloadJsonBtn').addEventListener('click', exportData);
    
    document.getElementById('darkModeToggle').addEventListener('change', saveSettings);
    document.getElementById('autoRefreshToggle').addEventListener('change', saveSettings);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const compareModal = document.getElementById('compareModal');
        const settingsModal = document.getElementById('settingsModal');
        
        if (e.target === compareModal) {
            compareModal.style.display = 'none';
        }
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
}