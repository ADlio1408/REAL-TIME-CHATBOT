<html>
<head>
    <title>Chat Notifications</title>
</head>

<body>

<h2>Real-Time Chatbot Notifications</h2>

<script>

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// SOCKET CONNECTION
setInterval(async () => {

    const response = await fetch(
        "http://localhost:5000/api/messages/latest"
    );

    const data = await response.json();

    if (data.text) {

        new Notification("New Message", {
            body: data.text
        });

    }

}, 5000);

</script>

</body>
</html>