const queryElement = document.getElementById('query') as HTMLInputElement;
const convertButton = document.getElementById('convert') as HTMLButtonElement;
const iconList = document.getElementById('icons') as HTMLDivElement;
const preview = document.getElementById('preview') as HTMLDivElement;
const colorbar = document.getElementById('colorbar') as HTMLDivElement;

const previewElements = {
    title: document.getElementById('title') as HTMLHeadingElement,
    artist: document.getElementById('artist') as HTMLHeadingElement,
    album: document.getElementById('album') as HTMLHeadingElement,
    // duration: document.getElementById('duration') as HTMLHeadingElement,
    // url: document.getElementById('url') as HTMLHeadingElement,
    image: document.getElementById('image') as HTMLImageElement
}

const icons = [
    "spotify",
    "youtube",
    "youtubemusic",
    "tidal"
]

const iconElements: {
    [key: string]: HTMLImageElement
} = {}

icons.forEach((icon) => {
    const iconElement = document.createElement('img');
    iconElement.src = `https://cdn.simpleicons.org/${icon}/ffffff`;
    iconElement.width = 32;
    iconElement.height = 32;
    iconList.appendChild(iconElement);

    iconElements[icon] = iconElement;
});


queryElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        convertButton.click();
    }
})

queryElement.addEventListener('input', async () => {
    const query = queryElement.value;

    if (!query) {
        Object.values(iconElements).forEach((icon) => {
            icon.className = '';
        });
        return;
    }

    const res = await fetch(`/api/lookup?query=${query}`);
    const data = await res.json() as {
        processor: {
            name: string,
            icon: string,
            color: string
        },
        results: {
            [key: string]: {
                name: string,
                artist: string,
                album: string,
                url: string,
                error: string
                processor: {
                    name: string,
                    icon: string,
                    color: string
                }
            }
        }
    };

    if (data.processor.icon) {
        Object.entries(iconElements).forEach(([key, value]) => {
            if (key === data.processor.icon) {
                value.className = 'deselcted';
                value.style.outline = '2px solid green';
            }
        });
    }

    preview.style.opacity = '1';
    colorbar.style.backgroundColor = data.processor.color;

    previewElements.title.innerText = data.results["Spotify"].name || data.results["Youtube"].name || data.results["Tidal"].name;
    previewElements.artist.innerText = data.results["Spotify"].artist || data.results["Youtube"].artist || data.results["Tidal"].artist;
    previewElements.album.innerText = data.results["Spotify"].album || data.results["Youtube"].album || data.results["Tidal"].album;

    Object.entries(data.results).forEach(([processorName, result]) => {
        console.log(result)
        const ele = iconElements[result.processor.icon]

        if (!result.name) {
            ele.style.outline = '2px solid red';
            ele.className = 'deselcted';
        } else {
            ele.className = 'clickable';

            ele.onclick = () => {
                navigator.clipboard.writeText(result.url);
                alert(`Copied ${result.url} to clipboard`);
            }
        }
    })



})


convertButton.addEventListener('click', async () => {
    const query = queryElement.value;
    const res = await fetch(`/api/search?query=${query}`);
    const data = await res.json();

    console.log(data);
});