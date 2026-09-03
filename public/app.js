let currentUser = null;


/* SHOW LOGIN */

function showLogin() {

    hideAll();

    document.getElementById(
        "login"
    ).style.display = "block";

}


/* SHOW REGISTER */

function showRegister() {

    hideAll();

    document.getElementById(
        "register"
    ).style.display = "block";

}


/* STUDENT */

function showStudent() {

    hideAll();

    document.getElementById(
        "student"
    ).style.display = "block";

    document.getElementById(
        "studentName"
    ).innerText =
        "Welcome " + currentUser.name;

}


/* PRINT */

function showPrint() {

    hideAll();

    document.getElementById(
        "print"
    ).style.display = "block";

}


/* HIDE ALL */

function hideAll() {

    const pages = [
        "login",
        "register",
        "student",
        "print",
        "requests",
        "admin"
    ];

    pages.forEach(page => {

        document.getElementById(
            page
        ).style.display = "none";

    });

}


/* REGISTER */

async function register() {

    const name =
        document.getElementById(
            "name"
        ).value;

    const email =
        document.getElementById(
            "email"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;


    const response =
        await fetch("/register", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })

        });


    const data =
        await response.json();


    document.getElementById(
        "registerMessage"
    ).innerText =
        data.message;


    if (response.ok) {

        setTimeout(
            showLogin,
            1000
        );

    }

}


/* LOGIN */

async function login() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value;

    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const response =
        await fetch("/login", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });


    const data =
        await response.json();


    if (!response.ok) {

        document.getElementById(
            "loginMessage"
        ).innerText =
            data.message;

        return;

    }


    currentUser = data;


    if (data.role === "admin") {

        hideAll();

        document.getElementById(
            "admin"
        ).style.display = "block";

        getAdminRequests();

    } else {

        showStudent();

    }

}


/* SUBMIT PRINT */

async function submitPrint() {

    const file =
        document.getElementById(
            "file"
        ).value;

    const copies =
        document.getElementById(
            "copies"
        ).value;

    const printType =
        document.getElementById(
            "printType"
        ).value;


    if (!file) {

        alert("Enter PDF file name");

        return;

    }


    const response =
        await fetch("/print", {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                user_id:
                    currentUser.id,

                file_name:
                    file,

                copies:
                    copies,

                print_type:
                    printType

            })

        });


    const data =
        await response.json();


    document.getElementById(
        "printMessage"
    ).innerText =
        data.message +
        " | Queue Number: " +
        data.queueNumber;

}


/* MY REQUESTS */

async function getMyRequests() {

    const response =
        await fetch(
            `/requests/${currentUser.id}`
        );


    const data =
        await response.json();


    const table =
        document.getElementById(
            "requestTable"
        );

    table.innerHTML = "";


    data.forEach(request => {

        table.innerHTML += `

            <tr>

                <td>
                    ${request.file_name}
                </td>

                <td>
                    ${request.copies}
                </td>

                <td>
                    ${request.print_type}
                </td>

                <td>
                    ${request.queue_number}
                </td>

                <td>
                    ${request.status}
                </td>

            </tr>

        `;

    });


    hideAll();

    document.getElementById(
        "requests"
    ).style.display = "block";

}


/* ADMIN */

async function getAdminRequests() {

    const response =
        await fetch("/admin");


    const data =
        await response.json();


    const table =
        document.getElementById(
            "adminTable"
        );

    table.innerHTML = "";


    data.forEach(request => {

        table.innerHTML += `

            <tr>

                <td>
                    ${request.queue_number}
                </td>

                <td>
                    ${request.name}
                </td>

                <td>
                    ${request.file_name}
                </td>

                <td>
                    ${request.copies}
                </td>

                <td>
                    ${request.print_type}
                </td>

                <td>

                    <select
                        onchange="changeStatus(
                            ${request.id},
                            this.value
                        )"
                    >

                        <option ${
                            request.status === "Waiting"
                            ? "selected"
                            : ""
                        }>
                            Waiting
                        </option>

                        <option ${
                            request.status === "Printing"
                            ? "selected"
                            : ""
                        }>
                            Printing
                        </option>

                        <option ${
                            request.status === "Completed"
                            ? "selected"
                            : ""
                        }>
                            Completed
                        </option>

                        <option ${
                            request.status === "Rejected"
                            ? "selected"
                            : ""
                        }>
                            Rejected
                        </option>

                    </select>

                </td>

            </tr>

        `;

    });

}


/* CHANGE STATUS */

async function changeStatus(
    id,
    status
) {

    await fetch(
        `/status/${id}`,
        {

            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                status
            })

        }
    );


    getAdminRequests();

}


/* LOGOUT */

function logout() {

    currentUser = null;

    showLogin();

}


showLogin();