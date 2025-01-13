# Node JS and Mongo DB

I created an API in Node JS and Mongo DB for user authentication, user profile, social network posts, and media upload.  
It allows you to design the frontend as you want. All the APIs are provided; you just need to call them and render it in the design of your choice.

## Installation

Run the following commands in the "api" folder:

```bash
npm update
npm install nodemon
nodemon index.js
```

Paste the "nodejs-mongodb" folder in your "htdocs" folder if you are using XAMPP or MAMP, or in "www" folder if you are using WAMP.
Project can be accessed from: `http://localhost/nodejs-mongodb/web/index.html`

## API Documentation

**Base URL:** `http://localhost:3000`

### User Authentication & Profile

<details>
  <summary><b>POST /register</b></summary>

**Description:** Register a new user.
### Arguments
- **name** (string): Required. Name of user.
- **email** (string): Required. Email of user.
- **password** (string): Required. Password of user.
### Example Request
```bash
curl -X POST http://localhost:3000/register \
-d "name=Adnan&email=adnan@gmail.com&password=adnan"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Account has been registered. You can login now."
}
```
- **200 OK:** Request successful.

### Response

```json
{
    "status": "error",
    "message": "Email already exists."
}
```
</details>

<details>
  <summary><b>POST /login</b></summary>

**Description:** Logs-in a user.
### Arguments
- **email** (string): Required. Email of user.
- **password** (string): Required. Password of user.
### Example Request
```bash
curl -X POST http://localhost:3000/login \
-d "email=adnan@gmail.com&password=adnan"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Login successfully.",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz",
    "user": {
        "_id": "676db209053557d2d7b23de5",
        "name": "Adnan Afzal",
        "email": "adnan@gmail.com"
    }
}
```
</details>

<details>
  <summary><b>POST /save-profile</b></summary>

**Description:** Update user name or profile image.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **name** (string): Required. Name of user.
- **profileImage** (file): Optional. New profile image.
### Example Request
```bash
curl -X POST http://localhost:3000/save-profile \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "profileImage=@path/to/your/file.jpg" \
-F "name=Adnan"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Profile has been updated.",
    "profileImage": {
        "size": 577210,
        "path": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG",
        "name": "Photo0032.JPG",
        "type": "image/jpeg"
    }
}
```
</details>

<details>
  <summary><b>POST /me</b></summary>

**Description:** Returns the authenticated user.
### Headers
- **Authorization:** Required. Bearer {token}
### Example Request
```bash
curl -X POST http://localhost:3000/me \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "user": {
        "_id": "676db209053557d2d7b23de5",
        "name": "Adnan Afzal",
        "email": "adnan@gmail.com",
        "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
    },
    "unreadNotifications": 0
}
```
</details>

<details>
  <summary><b>POST /logout</b></summary>

**Description:** Logs-out the user.
### Headers
- **Authorization:** Required. Bearer {token}
### Example Request
```bash
curl -X POST http://localhost:3000/logout \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Logout successfully."
}
```
</details>

<details>
  <summary><b>POST /change-password</b></summary>

**Description:** Change password of user.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **password** (string): Required. Current password of user.
- **newPassword** (string): Required. New password of user.
- **confirmPassword** (string): Required. Re-type new password.
### Example Request
```bash
curl -X POST http://localhost:3000/change-password \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "password=adnan&newPassword=adnan565&confirmPassword=adnan565"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Password has been changed."
}
```
</details>

### Posts

<details>
  <summary><b>POST /sn/posts/create</b></summary>

**Description:** Creates a new social network post.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **caption** (string): Optional. Caption of post.
- **type** (string): Required. ["post", "shared", "page", "group"]
- **pageId** (string): Optional. Page ID, in case the post is being posted on a page.
- **groupId** (string): Optional. Group ID, in case the post is being posted on a group.
- **files[]** (Array of files): Optional. Images or videos in post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/create \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "caption=My first post" \
-F "files[]=[@path/to/your/file.jpg]"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been created.",
    "post": {
        "_id": "6772d2573e3a7f1d0d35cefa",
        "caption": "My first post",
        "type": "post",
        "files": [
            {
                "name": "799226c3-2ef0-41ee-9dcb-3cd3f0029055.MP4",
                "size": 4545977,
                "type": "video/mp4",
                "path": "http://localhost:3000/uploads/public/posts/3cd3f0029055.MP4"
            }
        ],
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "createdAt": "12/30/2024, 10:03:19 PM",
        "updatedAt": "12/30/2024, 10:03:19 PM",
        "user": {
            "_id": "676db209053557d2d7b23de5",
            "name": "Adnan Afzal",
            "email": "adnan@gmail.com",
            "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
        }
    }
}
```
</details>

<details>
  <summary><b>POST /sn/posts/share</b></summary>

**Description:** Shares a post on your timeline.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post that needs to be shared.
- **caption** (string): Optional. Caption of post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/share \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6773799669bb298f68d9a833" \
-d "caption=Sharing"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been shared."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/fetch-sharers</b></summary>

**Description:** Fetch users who has shared the post.
### Arguments
- **_id** (string): Required. ID of post.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/fetch-sharers \
-d "_id=6773799669bb298f68d9a833" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "sharers": [
        {
            "_id": "67738f67d5b017474582ef02",
            "postId": "6773799669bb298f68d9a833",
            "user": {
                "_id": "676db209053557d2d7b23de5",
                "name": "Adnan Afzal",
                "email": "adnan@gmail.com",
                "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
            },
            "createdAt": "12/31/2024, 11:29:59 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/fetch</b></summary>

**Description:** Fetch all the posts from social network.
### Arguments
- **userId** (string): Optional. ID of user to return that user's posts only.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/fetch \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "posts": [
        {
            "_id": "6773880c5c988c96aeff94f1",
            "user": {
                "_id": "676db209053557d2d7b23de5",
                "name": "Adnan Afzal",
                "email": "adnan@gmail.com",
                "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
            },
            "caption": "Check this out.",
            "type": "shared",
            "sharedPost": {
                "_id": "6773799669bb298f68d9a833",
                "user": {
                    "_id": "676db209053557d2d7b23de5",
                    "name": "Adnan Afzal",
                    "email": "adnan@gmail.com",
                    "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
                },
                "caption": "Test",
                "type": "post",
                "files": [],
                "views": 0,
                "likes": 1,
                "comments": 0,
                "shares": 1,
                "hasLiked": false,
                "createdAt": "12/31/2024, 9:56:54 AM"
            },
            "files": [
                {
                    "name": "Screenshot 2024-12-31 at 9.14. AM.png",
                    "size": 87437,
                    "type": "image/png",
                    "path": "http://localhost:3000/uploads/public/posts/6773799669bb298f68d9a833/Screenshot 2024-12-31 at 9.14. AM.png"
                }
            ],
            "views": 0,
            "likes": 1,
            "comments": 0,
            "shares": 0,
            "hasLiked": true,
            "createdAt": "12/31/2024, 10:58:36 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/fetch/6772d21a3e3a7f1d0d35cef9</b></summary>

**Description:** Fetch single post.
### Parameters
- **_id** (string): Required. ID of post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/fetch/6772d21a3e3a7f1d0d35cef9
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "posts": [
        {
            "_id": "6772d21a3e3a7f1d0d35cef9",
            "user": {
                "_id": "676db209053557d2d7b23de5",
                "name": "Adnan Afzal",
                "email": "adnan@gmail.com",
                "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
            },
            "caption": "test",
            "type": "post",
            "files": [],
            "views": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "hasLiked": false,
            "createdAt": "12/30/2024, 10:02:18 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/update</b></summary>

**Description:** Updates a post.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **_id** (string): Required. ID of post that needs to be updated.
- **caption** (string): Optional. Caption of post.
- **files[]** ( Array of files): Optional. Images or videos in post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/update \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "caption=My updated post" \
-F "files[]=[@path/to/your/file.jpg]"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been updated."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/remove-file</b></summary>

**Description:** Removes a file from the post.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post.
- **path** (string): Optional. The path of file.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/remove-file \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6772d21a3e3a7f1d0d35cef9" \
-d "path=http://localhost:3000/uploads/public/posts/6772d21a3e3a7f1d0d35cef9/image.png"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "File has been removed."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/delete</b></summary>

**Description:** Delete the post.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/delete \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6772d21a3e3a7f1d0d35cef9"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been deleted."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/toggle-like</b></summary>

**Description:** Likes or dislikes a post.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/toggle-like \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6772d334ace8f55f58cc3883"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been liked.",
    "type": "liked"
}
```
</details>

<details>
  <summary><b>POST /sn/posts/fetch-likers</b></summary>

**Description:** Fetch all the people who has liked a post.
### Arguments
- **_id** (string): Required. ID of post.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/fetch-likers \
-d "_id=6772d334ace8f55f58cc3883" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "likers": [
        {
            "_id": "6772d4f76e772a8eff70bb40",
            "user": {
                "_id": "676db209053557d2d7b23de5",
                "name": "Adnan Afzal",
                "email": "adnan@gmail.com",
                "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
            },
            "createdAt": "12/30/2024, 10:14:31 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/comments/send</b></summary>

**Description:** Post a comment on a post.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post.
- **comment** (string): Required. Comment to be posted.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/comments/send \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6772d334ace8f55f58cc3883" \
-d "comment=nice"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Comment has been posted.",
    "comment": {
        "_id": "6772d6e66e772a8eff70bb42",
        "user": {
            "_id": "676db209053557d2d7b23de5",
            "name": "Adnan Afzal",
            "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
        },
        "comment": "nice",
        "replies": 0,
        "createdAt": "12/30/2024, 10:22:46 PM"
    }
}
```
</details>

<details>
  <summary><b>POST /sn/posts/comments/fetch</b></summary>

**Description:** Fetch comments posted on a post.
### Arguments
- **_id** (string): Required. ID of post.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/comments/fetch \
-d "_id=6772d334ace8f55f58cc3883" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Comments has been fetched.",
    "comments": [
        {
            "_id": "6772d6e66e772a8eff70bb42",
            "user": {
                "_id": "676db209053557d2d7b23de5",
                "name": "Adnan Afzal",
                "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
            },
            "comment": "nice",
            "replies": 1,
            "repliesArr": [
                {
                    "_id": "6772d90e6e772a8eff70bb44",
                    "user": {
                        "_id": "676db209053557d2d7b23de5",
                        "name": "Adnan Afzal",
                        "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
                    },
                    "reply": "Thanks.",
                    "createdAt": "12/30/2024, 10:31:58 PM"
                }
            ],
            "createdAt": "12/30/2024, 10:22:46 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/comments/fetch-single</b></summary>

**Description:** Fetch single comment.
### Arguments
- **_id** (string): Required. ID of post.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/comments/fetch-single \
-d "_id=6772d6e66e772a8eff70bb42" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Comment has been fetched.",
    "comment": {
        "_id": "6772d6e66e772a8eff70bb42",
        "user": {
            "_id": "676db209053557d2d7b23de5",
            "name": "Adnan Afzal",
            "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
        },
        "comment": "nice",
        "replies": 1,
        "repliesArr": [
            {
                "_id": "6772d90e6e772a8eff70bb44",
                "user": {
                    "_id": "676db209053557d2d7b23de5",
                    "name": "Adnan Afzal",
                    "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
                },
                "reply": "Thanks.",
                "createdAt": "12/30/2024, 10:31:58 PM"
            }
        ],
        "createdAt": "12/30/2024, 10:22:46 PM"
    }
}
```
</details>

<details>
  <summary><b>POST /sn/posts/comments/update</b></summary>

**Description:** Updates a comment.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of comment.
- **comment** (string): Required. Updated comment text.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/comments/update \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6772d6e66e772a8eff70bb42" \
-d "comment=nice"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Comment has been updated."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/comments/delete</b></summary>

**Description:** Deletes my comment.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of comment.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/comments/delete \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "caption=6772d6e66e772a8eff70bb42"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Comment has been deleted."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/replies/send</b></summary>

**Description:** Sends a reply to a comment.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of comment.
- **reply** (string): Required. Reply to be posted.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/replies/send \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=6772d6e66e772a8eff70bb42" \
-d "reply=Thanks."
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Reply has been posted.",
    "reply": {
        "_id": "6772d90e6e772a8eff70bb44",
        "user": {
            "_id": "676db209053557d2d7b23de5",
            "name": "Adnan Afzal",
            "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
        },
        "reply": "Thanks.",
        "createdAt": "12/30/2024, 10:31:58 PM"
    }
}
```
</details>

<details>
  <summary><b>POST /sn/posts/replies/fetch</b></summary>

**Description:** Fetch replies on a comment.
### Arguments
- **_id** (string): Required. ID of comment.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/replies/fetch \
-d "_id=677243747242a14a24bbf0e4" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Reply has been fetched.",
    "replies": [{
        "_id": "677243747242a14a24bbf0e4",
        "user": {
            "_id": "676db209053557d2d7b23de5",
            "name": "Adnan Afzal",
            "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
        },
        "reply": "Thanks.",
        "comment": "Nice.",
        "createdAt": "12/30/2024, 11:53:40 AM"
    }]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/replies/fetch-single</b></summary>

**Description:** Fetch single reply on a comment.
### Arguments
- **_id** (string): Required. ID of comment.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/replies/fetch-single \
-d "_id=677243747242a14a24bbf0e4" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Reply has been fetched.",
    "reply": {
        "_id": "677243747242a14a24bbf0e4",
        "user": {
            "_id": "676db209053557d2d7b23de5",
            "name": "Adnan Afzal",
            "profileImage": "http://localhost:3000/uploads/public/profiles/Photo0032.JPG"
        },
        "reply": "Thanks.",
        "comment": "Nice.",
        "createdAt": "12/30/2024, 11:53:40 AM"
    }
}
```
</details>

<details>
  <summary><b>POST /sn/posts/replies/update</b></summary>

**Description:** Update your reply.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of reply.
- **reply** (string): Required. Updated reply text.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/replies/update \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677243747242a14a24bbf0e4" \
-d "reply=Nice"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Reply has been updated."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/replies/delete</b></summary>

**Description:** Delete my reply.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of reply.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/replies/delete \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "caption=677243747242a14a24bbf0e4"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Reply has been deleted."
}
```
</details>

### Pages

<details>
  <summary><b>POST /sn/pages/create</b></summary>

**Description:** Creates a new page.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **name** (string): Required. Name of the page.
- **description** (string): Required. A little description about the page.
- **image** (file): Required. Cover photo for the page.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/create \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "name=My page" \
-F "description=My page" \
-F "image=@path/to/your/file.jpg"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Page has been created.",
    "page": {
        "_id": "67790963dd4859ee4d380471",
        "name": "My page",
        "description": "My page",
        "userId": "677501e0300a154edcd8f40c",
        "followers": 0,
        "image": {
            "path": "http://localhost:3000/uploads/public/pages/8126855cd4c9.png",
            "name": "Photo0032.JPG",
            "size": 577210
        },
        "createdAt": "Sat, 04 Jan 2025 10:11:47 GMT",
        "updatedAt": "Sat, 04 Jan 2025 10:11:47 GMT",
    }
}
```
</details>

<details>
  <summary><b>POST /sn/pages/fetch-single</b></summary>

**Description:** Fetch detail of a page.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **_id** (string): Required. ID of page.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/fetch-single \
-d "_id=67790963dd4859ee4d380471" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "page": {
        "_id": "67790963dd4859ee4d380471",
        "name": "test",
        "description": "test",
        "user": {
            "_id": "677501e0300a154edcd8f40c",
            "name": "Adnan",
            "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg"
        },
        "followersCount": 1,
        "image": "http://localhost:3000/uploads/public/pages/8126855cd4c9.png",
        "isFollowing": true,
        "isMyPage": true,
        "createdAt": "1/4/2025, 3:11:47 PM",
        "followers": [
            {
                "_id": "67790b4bb593e623fe120e72",
                "userId": "677501e0300a154edcd8f40c",
                "name": "Adnan",
                "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg",
                "createdAt": "1/4/2025, 3:19:55 PM"
            }
        ],
        "posts": [
            {
                "_id": "67790acadd4859ee4d380472",
                "user": {
                    "_id": "677501e0300a154edcd8f40c",
                    "name": "Adnan",
                    "email": "adnan@gmail.com",
                    "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg"
                },
                "caption": "Post in page.",
                "type": "page",
                "sharedPost": null,
                "files": [],
                "views": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "hasLiked": false,
                "createdAt": "1/4/2025, 3:17:46 PM",
                "page": {
                    "_id": "67790963dd4859ee4d380471",
                    "name": "test",
                    "followers": 1,
                    "image": "http://localhost:3000/uploads/public/pages/8126855cd4c9.png"
                }
            }
        ]
    }
}
```
</details>

<details>
  <summary><b>POST /sn/pages/toggle-follow</b></summary>

**Description:** Follow or unfollow a page.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of page.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/toggle-follow \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=67790963dd4859ee4d380471"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Page has been followed."
}
```
</details>

<details>
  <summary><b>POST /sn/pages/fetch</b></summary>

**Description:** Fetch pages.
### Arguments
- **query** (string): Optional. Search by page name.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/fetch \
-d "query=test" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "pages": [
        {
            "_id": "67790963dd4859ee4d380471",
            "name": "test",
            "description": "test",
            "status": "active",
            "userId": "677501e0300a154edcd8f40c",
            "followers": 1,
            "isFollowed": false,
            "image": "http://localhost:3000/uploads/public/pages/8126855cd4c9.png",
            "createdAt": "1/4/2025, 3:11:47 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/pages/fetch-my</b></summary>

**Description:** Fetch pages that I own.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **query** (string): Optional. Search by page name.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/fetch-my \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "query=test" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "pages": [
        {
            "_id": "67790963dd4859ee4d380471",
            "name": "test",
            "description": "test",
            "status": "active",
            "userId": "677501e0300a154edcd8f40c",
            "followers": 1,
            "isFollowed": false,
            "image": "http://localhost:3000/uploads/public/pages/8126855cd4c9.png",
            "createdAt": "1/4/2025, 3:11:47 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/pages/fetch-my-followed</b></summary>

**Description:** Fetch pages that I am following.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **query** (string): Optional. Search by page name.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/fetch-my-followed \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "query=test" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "pages": [
        {
            "_id": "67790963dd4859ee4d380471",
            "name": "test",
            "description": "test",
            "status": "active",
            "userId": "677501e0300a154edcd8f40c",
            "followers": 1,
            "isFollowed": false,
            "image": "http://localhost:3000/uploads/public/pages/8126855cd4c9.png",
            "createdAt": "1/4/2025, 3:11:47 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/pages/fetch-followers</b></summary>

**Description:** Fetch followers of a page.
### Arguments
- **_id** (string): Required. ID of page.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/fetch-followers \
-d "_id=67790963dd4859ee4d380471" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "followers": [
        {
            "_id": "67790b4bb593e623fe120e72",
            "userId": "677501e0300a154edcd8f40c",
            "name": "Adnan",
            "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg",
            "createdAt": "1/4/2025, 3:19:55 PM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/pages/update</b></summary>

**Description:** Update page created by you.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **_id** (string): Required. ID of page that needs to be updated.
- **name** (string): Required. Name of the page.
- **description** (string): Required. A little description about the page.
- **image** (file): Optional. Cover photo for the page.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/update \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "_id=67790963dd4859ee4d380471" \
-F "name=My page" \
-F "description=My page" \
-F "image=@path/to/your/file.jpg"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Page has been updated.",
    "page": {
        "name": "My page",
        "description": "My page",
        "updatedAt": "Sat, 04 Jan 2025 12:26:28 GMT",
        "image": {
            "path": "http://localhost:3000/uploads/public/pages/187f9dfe4507.png",
            "name": "Photo0032.JPG",
            "size": 577210
        }
    }
}
```
</details>

<details>
  <summary><b>POST /sn/pages/delete</b></summary>

**Description:** Deletes a page.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of page that needs to be deleted.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/pages/delete \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=67790963dd4859ee4d380471"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Page has been deleted."
}
```
</details>

### Groups

<details>
  <summary><b>POST /sn/groups/create</b></summary>

**Description:** Creates a new group.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **name** (string): Required. Name of group.
- **description** (string): Required. A little description about the group.
- **image** (file): Required. Cover photo for group.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/create \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "name=My group" \
-F "description=This is a testing group" \
-F "image=@path/to/your/file.jpg"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Group has been created.",
    "group": {
        "_id": "677f0d36fc4635da9658c8a7",
        "name": "My group",
        "description": "This is a testing group",
        "userId": "677501e0300a154edcd8f40c",
        "members": 0,
        "image": "http://localhost:3000/uploads/public/groups/33028df6434c.png",
        "createdAt": "Wed, 08 Jan 2025 23:41:42 GMT",
        "updatedAt": "Wed, 08 Jan 2025 23:41:42 GMT",
    }
}
```
</details>

<details>
  <summary><b>POST /sn/groups/fetch</b></summary>

**Description:** Fetch groups.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **query** (string): Optional. To search group by name.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/fetch \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "query=My group" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "groups": [
        {
            "_id": "677f0d36fc4635da9658c8a7",
            "name": "My group",
            "description": "This is a testing group",
            "members": 0,
            "isJoined": false,
            "image": "http://localhost:3000/uploads/public/groups/33028df6434c.png",
            "createdAt": "1/9/2025, 4:41:42 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/groups/fetch-my</b></summary>

**Description:** Fetch my created groups.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **query** (string): Optional. To search group by name.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/fetch-my \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "query=My group" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "groups": [
        {
            "_id": "677f0d36fc4635da9658c8a7",
            "name": "My group",
            "description": "This is a testing group",
            "members": 0,
            "isJoined": false,
            "image": "http://localhost:3000/uploads/public/groups/33028df6434c.png",
            "createdAt": "1/9/2025, 4:41:42 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/groups/fetch-my-joined</b></summary>

**Description:** Fetch groups I am a member of.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **query** (string): Optional. To search group by name.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/fetch-my-joined \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "query=My group" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "groups": [
        {
            "_id": "677f0d36fc4635da9658c8a7",
            "name": "My group",
            "description": "This is a testing group",
            "members": 0,
            "isJoined": false,
            "image": "http://localhost:3000/uploads/public/groups/33028df6434c.png",
            "createdAt": "1/9/2025, 4:41:42 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/groups/fetch-single</b></summary>

**Description:** Fetch detail of the group.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **_id** (string): Required. ID of group.
- **page** (Integer): Required. Required for pagination on posts.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/fetch-single \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f0d36fc4635da9658c8a7" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "group": {
        "_id": "677f0d36fc4635da9658c8a7",
        "name": "My group",
        "description": "This is a testing group",
        "membersCount": 1,
        "image": "http://localhost:3000/uploads/public/groups/33028df6434c.png",
        "isMember": false,
        "isAdmin": true,
        "createdAt": "1/9/2025, 4:41:42 AM",
        "members": [
            {
                "_id": "677f10cb32165447fe3b1835",
                "userId": "677ce2c5444f1da568429d03",
                "name": "Adnan 3",
                "profileImage": "",
                "createdAt": "1/9/2025, 4:56:59 AM"
            }
        ],
        "posts": [
            {
                "_id": "677f105632165447fe3b1834",
                "user": {
                    "_id": "677501e0300a154edcd8f40c",
                    "name": "Adnan",
                    "email": "adnan@gmail.com",
                    "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg"
                },
                "caption": "Test",
                "type": "group",
                "status": "published",
                "sharedPost": null,
                "files": [],
                "views": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "hasLiked": false,
                "createdAt": "1/9/2025, 4:55:02 AM"
            }
        ],
        "pendingPosts": [
            {
                "_id": "677f10eb32165447fe3b1836",
                "user": {
                    "_id": "677ce2c5444f1da568429d03",
                    "name": "Adnan 3",
                    "email": "adnan3@gmail.com",
                    "profileImage": ""
                },
                "caption": "Post by member.",
                "type": "group",
                "status": "pending",
                "sharedPost": null,
                "files": [],
                "views": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "hasLiked": false,
                "createdAt": "1/9/2025, 4:57:31 AM"
            }
        ],
        "pendingPostsCount": 1
    }
}
```
</details>

<details>
  <summary><b>POST /sn/groups/toggle-join</b></summary>

**Description:** Join or leave the group.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of group.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/toggle-join \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f0d36fc4635da9658c8a7"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Group has been joined."
}
```
</details>

<details>
  <summary><b>POST /sn/groups/fetch-posts</b></summary>

**Description:** Fetch posts of the group.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **_id** (string): Required. ID of group.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/fetch-posts \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f0d36fc4635da9658c8a7" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "posts": [
        {
            "_id": "677f105632165447fe3b1834",
            "user": {
                "_id": "677501e0300a154edcd8f40c",
                "name": "Adnan",
                "email": "adnan@gmail.com",
                "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg"
            },
            "caption": "Test",
            "type": "group",
            "status": "published",
            "sharedPost": null,
            "files": [],
            "views": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "hasLiked": false,
            "createdAt": "1/9/2025, 4:55:02 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/groups/fetch-pending-posts</b></summary>

**Description:** Fetch pending posts of group members.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of group.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/fetch-pending-posts \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f0d36fc4635da9658c8a7" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "posts": [
        {
            "_id": "677f105632165447fe3b1834",
            "user": {
                "_id": "677501e0300a154edcd8f40c",
                "name": "Adnan",
                "email": "adnan@gmail.com",
                "profileImage": "http://localhost:3000/uploads/public/profiles/IMG_1130.jpg"
            },
            "caption": "Test",
            "type": "group",
            "status": "published",
            "sharedPost": null,
            "files": [],
            "views": 0,
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "hasLiked": false,
            "createdAt": "1/9/2025, 4:55:02 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/posts/decline</b></summary>

**Description:** Decline a post of group member.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/decline \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f10eb32165447fe3b1836"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been declined."
}
```
</details>

<details>
  <summary><b>POST /sn/posts/accept</b></summary>

**Description:** Accepts a post of group member.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of post.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/posts/accept \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f10eb32165447fe3b1836"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Post has been published."
}
```
</details>

<details>
  <summary><b>POST /sn/groups/members</b></summary>

**Description:** Fetch members of the group.
### Headers
- **Authorization:** Optional. Bearer {token}
### Arguments
- **_id** (string): Required. ID of group.
- **page** (Integer): Required. Required for pagination.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/members \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f0d36fc4635da9658c8a7" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "members": [
        {
            "_id": "677f114932165447fe3b1837",
            "userId": "677ce2c5444f1da568429d03",
            "name": "Adnan 3",
            "profileImage": "",
            "createdAt": "1/9/2025, 4:59:05 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /sn/groups/remove-member</b></summary>

**Description:** Remove a member from group.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of member.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/remove-member \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f114932165447fe3b1837"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Group member has been removed."
}
```
</details>

<details>
  <summary><b>POST /sn/groups/update</b></summary>

**Description:** Update the group.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **_id** (string): Required. ID of group.
- **name** (string): Required. Name of group.
- **description** (string): Required. A little description about group.
- **image** (file): Optional. Cover photo of group.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/update \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "_id=677f0d36fc4635da9658c8a7" \
-F "name=My group" \
-F "description=This is a testing group" \
-F "image=@path/to/your/file.jpg"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Group has been updated.",
    "group": {
        "name": "My group",
        "description": "This is a testing group",
        "image": "http://localhost:3000/uploads/public/groups/f523abe9cc1d.png",
        "updatedAt": "Thu, 09 Jan 2025 00:22:18 GMT",
    }
}
```
</details>

<details>
  <summary><b>POST /sn/groups/delete</b></summary>

**Description:** Delete the group.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of group.
### Example Request
```bash
curl -X POST http://localhost:3000/sn/groups/delete \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=677f0d36fc4635da9658c8a7"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Group has been deleted."
}
```
</details>

### Media

<details>
  <summary><b>POST /media/upload</b></summary>

**Description:** Uploads a new media file.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **title** (string): Optional. Title of media.
- **alt** (string): Optional. Alt attribute for images.
- **caption** (string): Optional. Caption of media.
- **file** (file): Required. Media file.
### Example Request
```bash
curl -X POST http://localhost:3000/media/upload \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "title=My media" \
-F "alt=My media" \
-F "caption=My media" \
-F "file=@path/to/your/file.jpg"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Media has been uploaded.",
    "media": {
        "_id": "676effbea57ba0808a0da080",
        "title": "My media",
        "alt": "My media",
        "caption": "My media",
        "type": "public",
        "file": {
            "name": "IMG_1130.jpg",
            "path": "http://localhost:3000/uploads/public/media/61eb3c1076a3.jpg",
            "size": 2568669,
            "type": "image/jpeg"
        },
        "userId": "676db209053557d2d7b23de5",
        "createdAt": "12/28/2024, 12:27:58 AM",
        "updatedAt": "12/28/2024, 12:27:58 AM"
    }
}
```
</details>

<details>
  <summary><b>POST /media/fetch</b></summary>

**Description:** Fetch all my uploaded media.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **page** (Integer): Required. The page number of results to be fetched.
### Example Request
```bash
curl -X POST http://localhost:3000/media/fetch \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "page=1"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "media": [
        {
            "_id": "676effbea57ba0808a0da080",
            "title": "My media",
            "alt": "My media",
            "caption": "My media",
            "type": "public",
            "file": {
                "name": "IMG_1130.jpg",
                "path": "http://localhost:3000/uploads/public/media/61eb3c1076a3.jpg",
                "size": 2568669,
                "type": "image/jpeg"
            },
            "userId": "676db209053557d2d7b23de5",
            "createdAt": "12/28/2024, 12:27:58 AM",
            "updatedAt": "12/28/2024, 12:27:58 AM"
        }
    ]
}
```
</details>

<details>
  <summary><b>POST /media/fetch-single</b></summary>

**Description:** Fetch details of my single media file.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of media file.
### Example Request
```bash
curl -X POST http://localhost:3000/media/fetch-single \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-d "_id=676effbea57ba0808a0da080"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Data has been fetched.",
    "media": {
        "_id": "676effbea57ba0808a0da080",
        "title": "My media",
        "alt": "My media",
        "caption": "My media",
        "type": "public",
        "file": {
            "name": "IMG_1130.jpg",
            "path": "http://localhost:3000/uploads/public/media/61eb3c1076a3.jpg",
            "size": 2568669,
            "type": "image/jpeg"
        },
        "createdAt": "12/28/2024, 12:27:58 AM",
        "updatedAt": "12/28/2024, 12:27:58 AM"
    }
}
```
</details>

<details>
  <summary><b>POST /media/update</b></summary>

**Description:** Update already uploaded media file.
### Headers
- **Authorization:** Required. Bearer {token}
- **Content-Type:** Required. multipart/form-data
### Arguments
- **_id** (string): Required. ID of media file to be updated.
- **title** (string): Optional. Title of media.
- **alt** (string): Optional. Alt attribute for images.
- **caption** (string): Optional. Caption of media.
- **type** (string): Required. Is the media "public" or "private".
- **file** (file): Optional. Media file.
### Example Request
```bash
curl -X POST http://localhost:3000/media/update \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-H "Content-Type: multipart/form-data" \
-F "_id=676effbea57ba0808a0da080"
-F "title=My media" \
-F "alt=My media" \
-F "caption=My media" \
-F "type=public" \
-F "file=@path/to/your/file.jpg"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Media has been updated."
}
```
</details>

<details>
  <summary><b>POST /media/delete</b></summary>

**Description:** Delete media file.
### Headers
- **Authorization:** Required. Bearer {token}
### Arguments
- **_id** (string): Required. ID of media file to be deleted.
### Example Request
```bash
curl -X POST http://localhost:3000/media/delete \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nz" \
-F "_id=676effbea57ba0808a0da080"
```
### Status Codes
- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Media has been removed."
}
```
</details>

<br />

Complete documentation: https://adnan-tech.com/api-docs/nodejs-mongodb.php

<br />

<p>For any help, contact: support@adnan-tech.com</p>