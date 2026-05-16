self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'continue') {
        sendActionToClients('continue');
    } else if (event.action === 'exit') {
        sendActionToClients('exit');
    } else {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(function (clientList) {
                for (let i = 0; i < clientList.length; i++) {
                    let client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

function sendActionToClients(action) {
    clients.matchAll({ type: 'window' }).then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
            let client = clientList[i];
            client.postMessage({ action: action });
        }
    });
}
