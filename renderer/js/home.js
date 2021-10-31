const g = document.getElementById.bind(document);

const appVersion = g('appVersion');

window.app.getVersion().then(version => appVersion.innerText = `v${version}`);