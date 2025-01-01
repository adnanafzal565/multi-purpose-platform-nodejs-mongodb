# Node JS and Mongo DB

<p>I created an API in Node JS and Mongo DB for user authentication, user profile, social network posts and media upload.
It allows you to design the frontend as you want. All the APIs are provided, you just need to call them and render it in design of your choice.</p>

<p><b>Base URL:</b> http://localhost:3000</p>

## User Authentication & Profile

<details>
    <summary><b>POST /register</b></summary><br />
    <p><b>Description:</b> Register a new user.</p>

<h3>Arguments</h3>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>name</td>
                <td>string</td>
                <td>Required</td>
                <td>Name of user.</td>
            </tr>

            <tr>
                <td>email</td>
                <td>string</td>
                <td>Required</td>
                <td>Email of user.</td>
            </tr>

            <tr>
                <td>password</td>
                <td>string</td>
                <td>Required</td>
                <td>Password of user.</td>
            </tr>
        </tbody>
    </table>

<h3>Example Request</h3>
```
curl -X POST http://localhost:3000/register \
-d "name=Adnan&email=adnan@gmail.com&password=adnan"
```

<h3>Status Codes</h3>
    <ul>
        <li><strong>200 OK:</strong> Request successful.</li>
    </ul>

<h3>Response</h3>
```
{
    "status": "success",
    "message": "Account has been registered. You can login now."
}
```

<h3>Response (in case of error)</h3>

```
{
    "status": "error",
    "message": "Email already exists."
}
```
</details>

<br />
<p>For any help, contact: support@adnan-tech.com</p>