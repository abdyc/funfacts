document.addEventListener('DOMContentLoaded', () => {
    // Element selectors
    const background = document.getElementById('background');
    const loader = document.getElementById('loader');
    const factContainer = document.getElementById('fact-container');
    const factType = document.getElementById('fact-type');
    const factTitle = document.getElementById('fact-title');
    const factSummary = document.getElementById('fact-summary');
    const readMoreLink = document.getElementById('read-more');
    const shareBtn = document.getElementById('share-btn');
    const shareBtnText = document.getElementById('share-btn-text');
    const moreCategoriesBtn = document.getElementById('more-categories-btn');
    const extraCategories = document.getElementById('extra-categories');
    const onThisDayBtn = document.getElementById('on-this-day-btn');
    
    // Select all buttons that can be disabled during loading
    const allControlButtons = document.querySelectorAll('button');

    // --- Predefined Topics for Categories ---
    const predefinedTopics = {
        science: ['Black hole', 'DNA', 'Photosynthesis', 'General relativity', 'Quantum mechanics', 'Periodic table'],
        history: ['Roman Empire', 'World War II', 'Ancient Egypt', 'Industrial Revolution', 'Cold War', 'Renaissance'],
        technology: ['Internet', 'Artificial intelligence', 'Blockchain', '3D printing', 'GPS', 'Machine learning'],
        animals: ['Blue whale', 'Ant', 'Octopus', 'Honeybee', 'Arctic Fox', 'Tardigrade'],
        art: ['Mona Lisa', 'The Starry Night', 'Impressionism', 'Cubism', 'Street art', 'Michelangelo'],
        geography: ['Mount Everest', 'Amazon River', 'Sahara', 'Great Barrier Reef', 'Grand Canyon', 'Mariana Trench'],
        music: ['The Beatles', 'Jazz', 'Hip hop music', 'Ludwig van Beethoven', 'Electric guitar', 'Synthesizer'],
        film: ['The Godfather', 'Cinematography', 'Alfred Hitchcock', 'Star Wars', 'Pixar', 'Film noir'],
        space: ['Apollo 11', 'James Webb Space Telescope', 'Exoplanet', 'Supernova', 'Milky Way', 'Mars rover']
    };
    
    let currentFactTitle = '';

    // --- API and Data Handling ---
    
    async function fetchRandomWikipediaTopic() {
        await fetchAndDisplaySummary(`https://en.wikipedia.org/api/rest_v1/page/random/summary`, "Random Fact");
    }
    
    async function fetchTopicSummary(title, typeText) {
        await fetchAndDisplaySummary(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, typeText);
    }

    async function fetchCategorizedTopic(category) {
        const topics = predefinedTopics[category];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const typeText = category.charAt(0).toUpperCase() + category.slice(1) + " Fact";
        await fetchTopicSummary(randomTopic, typeText);
    }

    async function fetchOnThisDay() {
        showLoader(true);
        background.classList.remove('visible');
        try {
            const now = new Date();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`);
            if (!response.ok) throw new Error('Failed to fetch "On This Day" data.');
            const data = await response.json();
            if (!data.events || data.events.length === 0) throw new Error("No events found for this day.");
            const randomEvent = data.events[Math.floor(Math.random() * data.events.length)];
            const eventPage = randomEvent.pages[0];
            await fetchTopicSummary(eventPage.title, `On This Day: ${randomEvent.year}`);
        } catch (error) {
            console.error("Error fetching On This Day:", error);
            displayError();
        }
    }
    
    async function fetchAndDisplaySummary(url, typeText) {
        showLoader(true);
        background.classList.remove('visible');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
            const data = await response.json();
            handleFactData(data, typeText);
        } catch(error) {
            console.error("Error fetching summary:", error);
            displayError();
        }
    }
    
    function handleFactData(data, typeText) {
        currentFactTitle = data.title; // Store title for sharing
        const fact = {
            title: data.title,
            summary: data.extract,
            url: data.content_urls.desktop.page
        };
        let imageUrl = data.thumbnail ? data.thumbnail.source.replace(/\/\d+px-/, '/800px-') : null;
        displayFact(fact, typeText, imageUrl);
    }

    // --- UI and Display ---
    function displayFact(fact, type, imageUrl) {
        factType.classList.remove('fade-in');
        factTitle.classList.remove('fade-in');
        factSummary.classList.remove('fade-in');
        void factType.offsetWidth; 

        factType.textContent = type;
        factTitle.textContent = fact.title;
        factSummary.textContent = fact.summary;
        readMoreLink.href = fact.url;
        
        factType.classList.add('fade-in');
        factTitle.classList.add('fade-in');
        factSummary.classList.add('fade-in');

        const fallbackUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(fact.title.split('(')[0].trim())}`;
        setBackgroundImage(imageUrl || fallbackUrl, 'https://placehold.co/1600x900/1a202c/ffffff?text=Image+Not+Found');
    }

    function displayError() {
        factType.textContent = "Error";
        factTitle.textContent = "Oops!";
        factSummary.textContent = "Could not fetch a fact right now. Please try again.";
        setBackgroundImage('https://placehold.co/1600x900/1a202c/ffffff?text=Error', null);
    }

    function setBackgroundImage(primaryUrl, fallbackUrl) {
        const img = new Image();
        img.src = primaryUrl;
        img.onload = () => {
            background.style.backgroundImage = `url(${primaryUrl})`;
            background.classList.add('visible');
            showLoader(false);
        };
        img.onerror = () => {
            if (fallbackUrl) {
                setBackgroundImage(fallbackUrl, null);
            } else {
                background.style.backgroundImage = `url(https://placehold.co/1600x900/1a202c/ffffff?text=Image+Not+Found)`;
                background.classList.add('visible');
                showLoader(false);
            }
        };
    }

    function showLoader(isLoading) {
        allControlButtons.forEach(button => button.disabled = isLoading);
        if (isLoading) {
            loader.style.display = 'block';
            factContainer.classList.add('hidden');
        } else {
            loader.style.display = 'none';
            factContainer.classList.remove('hidden');
        }
    }
    
    function checkUrlForTopic() {
        const params = new URLSearchParams(window.location.search);
        const topic = params.get('topic');
        if (topic) {
            fetchTopicSummary(topic, 'Shared Fact');
        } else {
            fetchRandomWikipediaTopic();
        }
    }

    // --- Event Listeners ---
    document.getElementById('random-btn').addEventListener('click', fetchRandomWikipediaTopic);
    onThisDayBtn.addEventListener('click', fetchOnThisDay);
    
    document.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', () => fetchCategorizedTopic(button.dataset.category));
    });

    moreCategoriesBtn.addEventListener('click', () => {
        extraCategories.classList.toggle('hidden');
        moreCategoriesBtn.textContent = extraCategories.classList.contains('hidden') ? 'More...' : 'Less';
    });

    shareBtn.addEventListener('click', () => {
        const baseLink = window.location.origin + window.location.pathname;
        const shareLink = `${baseLink}?topic=${encodeURIComponent(currentFactTitle)}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = shareLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            shareBtnText.textContent = 'Copied Link!';
            setTimeout(() => { shareBtnText.textContent = 'Share'; }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            shareBtnText.textContent = 'Error!';
             setTimeout(() => { shareBtnText.textContent = 'Share'; }, 2000);
        }
        document.body.removeChild(textArea);
    });

    // --- Initial Load ---
    checkUrlForTopic();
});

