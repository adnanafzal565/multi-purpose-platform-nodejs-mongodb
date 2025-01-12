<?php
    $pdo = new PDO("mysql:host=localhost; dbname=api_docs;", "root", "root", [
        PDO::ATTR_PERSISTENT => true
    ]);

    // $pdo->query("DROP TABLE IF EXISTS api_headers, api_parameters, api_arguments, api_responses, apis");

    $pdo->query("CREATE TABLE IF NOT EXISTS sections(
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->query("CREATE TABLE IF NOT EXISTS apis(
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        section_id BIGINT UNSIGNED NOT NULL,
        name TEXT NULL,
        method TEXT NULL,
        description TEXT NULL,
        example_request TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        FOREIGN KEY (section_id) REFERENCES sections (id) ON UPDATE CASCADE ON DELETE CASCADE
    )");

    $pdo->query("CREATE TABLE IF NOT EXISTS api_headers(
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        api_id BIGINT UNSIGNED NOT NULL,
        name TEXT NULL,
        required TEXT NULL,
        description TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (api_id) REFERENCES apis (id) ON UPDATE CASCADE ON DELETE CASCADE
    )");

    $pdo->query("CREATE TABLE IF NOT EXISTS api_parameters(
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        api_id BIGINT UNSIGNED NOT NULL,
        name TEXT NULL,
        type TEXT NULL,
        required TEXT NULL,
        description TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (api_id) REFERENCES apis (id) ON UPDATE CASCADE ON DELETE CASCADE
    )");

    $pdo->query("CREATE TABLE IF NOT EXISTS api_arguments(
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        api_id BIGINT UNSIGNED NOT NULL,
        name TEXT NULL,
        type TEXT NULL,
        required TEXT NULL,
        description TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (api_id) REFERENCES apis (id) ON UPDATE CASCADE ON DELETE CASCADE
    )");

    $pdo->query("CREATE TABLE IF NOT EXISTS api_responses(
        id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
        api_id BIGINT UNSIGNED NOT NULL,
        status TEXT NULL,
        status_text TEXT NULL,
        response TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (api_id) REFERENCES apis (id) ON UPDATE CASCADE ON DELETE CASCADE
    )");

    if (isset($_GET["get_data"]))
    {
        $stmt = $pdo->prepare("SELECT * FROM sections ORDER BY id ASC");
        $stmt->execute([]);
        $sections = $stmt->fetchAll(PDO::FETCH_OBJ);

        foreach ($sections as $section)
        {
            $stmt = $pdo->prepare("SELECT * FROM apis WHERE section_id = ? AND deleted_at IS NULL ORDER BY id ASC");
            $stmt->execute([$section->id]);
            $apis = $stmt->fetchAll(PDO::FETCH_OBJ);

            foreach ($apis as $api)
            {
                $stmt = $pdo->prepare("SELECT * FROM api_headers WHERE api_id = ? ORDER BY id ASC");
                $stmt->execute([$api->id]);
                $api->headers = $stmt->fetchAll(PDO::FETCH_OBJ);

                $stmt = $pdo->prepare("SELECT * FROM api_parameters WHERE api_id = ? ORDER BY id ASC");
                $stmt->execute([$api->id]);
                $api->parameters = $stmt->fetchAll(PDO::FETCH_OBJ);

                $stmt = $pdo->prepare("SELECT * FROM api_arguments WHERE api_id = ? ORDER BY id ASC");
                $stmt->execute([$api->id]);
                $api->arguments = $stmt->fetchAll(PDO::FETCH_OBJ);

                $stmt = $pdo->prepare("SELECT * FROM api_responses WHERE api_id = ? ORDER BY id ASC");
                $stmt->execute([$api->id]);
                $api->responses = $stmt->fetchAll(PDO::FETCH_OBJ);
            }

            $section->apis = $apis;
        }

        echo json_encode([
            "status" => "success",
            "message" => "Data has been fetched.",
            "sections" => $sections
        ]);
        exit();
    }

    if (isset($_GET["add_section"]))
    {
        $name = $_POST["name"] ?? "";

        $stmt = $pdo->prepare("INSERT INTO sections(name, created_at, updated_at) VALUES (?, UTC_TIMESTAMP(), UTC_TIMESTAMP())");
        $stmt->execute([
            $name
        ]);
        $id = $pdo->lastInsertId();

        $stmt = $pdo->prepare("SELECT * FROM sections WHERE id = ?");
        $stmt->execute([$id]);
        $sections = $stmt->fetchAll(PDO::FETCH_OBJ);
        $section = $sections[0];

        echo json_encode([
            "status" => "success",
            "message" => "Section has been created.",
            "section" => $section
        ]);
        exit();
    }

    if (isset($_GET["add_api"]))
    {
        $section_id = $_POST["section_id"] ?? 0;
        $name = $_POST["name"] ?? "";
        $method = $_POST["method"] ?? "";
        $description = $_POST["description"] ?? "";
        $headers = json_decode($_POST["headers"] ?? "[]") ?? [];
        $parameters = json_decode($_POST["parameters"] ?? "[]") ?? [];
        $arguments = json_decode($_POST["arguments"] ?? "[]") ?? [];
        $example_request = $_POST["example_request"] ?? "";
        $status_codes = json_decode($_POST["status_codes"] ?? "[]") ?? [];

        $stmt = $pdo->prepare("INSERT INTO apis(section_id, name, method, description, example_request, created_at, updated_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())");
        $stmt->execute([
            $section_id, $name, $method, $description, $example_request
        ]);
        $id = $pdo->lastInsertId();

        foreach ($headers as $header)
        {
            $pdo->prepare("INSERT INTO api_headers(api_id, name, required, description, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $id, $header->name ?? "", $header->required ?? "", $header->description ?? ""
                ]);
        }

        foreach ($parameters as $parameter)
        {
            $pdo->prepare("INSERT INTO api_parameters(api_id, name, type, required, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $id, $parameter->name ?? "", $parameter->type ?? "", $parameter->required ?? "", $parameter->description ?? ""
                ]);
        }

        foreach ($arguments as $argument)
        {
            $pdo->prepare("INSERT INTO api_arguments(api_id, name, type, required, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $id, $argument->name ?? "", $argument->type ?? "", $argument->required ?? "", $argument->description ?? ""
                ]);
        }

        foreach ($status_codes as $status_code)
        {
            $pdo->prepare("INSERT INTO api_responses(api_id, status, status_text, response, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $id, $status_code->status ?? "", $status_code->status_text ?? "", $status_code->response ?? ""
                ]);
        }

        echo json_encode([
            "status" => "success",
            "message" => "API has been created."
        ]);
        exit();
    }

    if (isset($_GET["update_api"]))
    {
        $id = $_POST["id"] ?? 0;
        $section_id = $_POST["section_id"] ?? 0;
        $name = $_POST["name"] ?? "";
        $method = $_POST["method"] ?? "";
        $description = $_POST["description"] ?? "";
        $headers = json_decode($_POST["headers"] ?? "[]") ?? [];
        $parameters = json_decode($_POST["parameters"] ?? "[]") ?? [];
        $arguments = json_decode($_POST["arguments"] ?? "[]") ?? [];
        $example_request = $_POST["example_request"] ?? "";
        $status_codes = json_decode($_POST["status_codes"] ?? "[]") ?? [];

        $stmt = $pdo->prepare("SELECT * FROM apis WHERE id = ?");
        $stmt->execute([
            $id
        ]);
        $api = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$api)
        {
            echo json_encode([
                "status" => "error",
                "message" => "API not found."
            ]);
            exit();
        }

        $pdo->prepare("UPDATE apis SET section_id = ?, name = ?, method = ?, description = ?, example_request = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?")
            ->execute([
                $section_id, $name, $method, $description, $example_request, $api->id
            ]);

        $pdo->prepare("DELETE FROM api_headers WHERE api_id = ?")
            ->execute([
                $api->id
            ]);

        foreach ($headers as $header)
        {
            $pdo->prepare("INSERT INTO api_headers(api_id, name, required, description, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $api->id, $header->name ?? "", $header->required ?? "", $header->description ?? ""
                ]);
        }

        $pdo->prepare("DELETE FROM api_parameters WHERE api_id = ?")
            ->execute([
                $api->id
            ]);

        foreach ($parameters as $parameter)
        {
            $pdo->prepare("INSERT INTO api_parameters(api_id, name, type, required, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $api->id, $parameter->name ?? "", $parameter->type ?? "", $parameter->required ?? "", $parameter->description ?? ""
                ]);
        }

        $pdo->prepare("DELETE FROM api_arguments WHERE api_id = ?")
            ->execute([
                $api->id
            ]);

        foreach ($arguments as $argument)
        {
            $pdo->prepare("INSERT INTO api_arguments(api_id, name, type, required, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $api->id, $argument->name ?? "", $argument->type ?? "", $argument->required ?? "", $argument->description ?? ""
                ]);
        }

        $pdo->prepare("DELETE FROM api_responses WHERE api_id = ?")
            ->execute([
                $api->id
            ]);

        foreach ($status_codes as $status_code)
        {
            $pdo->prepare("INSERT INTO api_responses(api_id, status, status_text, response, created_at, updated_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())")
                ->execute([
                    $api->id, $status_code->status ?? "", $status_code->status_text ?? "", $status_code->response ?? ""
                ]);
        }

        echo json_encode([
            "status" => "success",
            "message" => "API has been updated."
        ]);
        exit();
    }

    if (isset($_GET["delete_api"]))
    {
        $id = $_POST["id"] ?? 0;

        $pdo->prepare("UPDATE apis SET deleted_at = UTC_TIMESTAMP() WHERE id = ?")
            ->execute([
                $id
            ]);

        echo json_encode([
            "status" => "success",
            "message" => "API has been deleted."
        ]);
        exit();
    }
?>

<html>
    <head>
        <title>Generate API Documentation</title>

        <script src="../web/public/js/react.development.js"></script>
        <script src="../web/public/js/react-dom.development.js"></script>
        <script src="../web/public/js/babel.min.js"></script>
        <script src="../web/public/js/axios.min.js"></script>
        <script src="../web/public/js/sweetalert2@11.js"></script>

        <link rel="stylesheet" href="../web/public/css/bootstrap.css" />
        <script src="../web/public/js/jquery.js"></script>
        <script src="../web/public/js/bootstrap.js"></script>

        <style>
            details {
                margin-bottom: 1rem;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 1rem;
            }
            summary {
                font-weight: bold;
                cursor: pointer;
            }
            code {
                background: #f4f4f4;
                padding: 0.2rem 0.4rem;
                border-radius: 4px;
                text-wrap: balance;
            }
            pre {
                overflow-y: hidden !important;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
            }
            table th, table td {
                border: 1px solid #ddd;
                padding: 0.5rem;
                text-align: left;
            }
            table th {
                background: #f4f4f4;
            }
        </style>
    </head>

    <body>
        <div id="app"></div>

        <script type="text/babel">
            function App() {

                const [addingAPI, setAddingAPI] = React.useState(false);
                const [addingSection, setAddingSection] = React.useState(false);
                const [sections, setSections] = React.useState([]);
                const [apis, setApis] = React.useState([]);
                const [headers, setHeaders] = React.useState([]);
                const [parameters, setParameters] = React.useState([]);
                const [argumentsArr, setArguments] = React.useState([]);
                const [statusCodes, setStatusCodes] = React.useState([]);
                const [apiToEdit, setApiToEdit] = React.useState(null);

                React.useEffect(function () {
                    getData();
                }, []);

                function setStatusCodeValue(index, field, value) {
                    const tempStatusCodes = [...statusCodes];
                    tempStatusCodes[index][field] = value;
                    setStatusCodes(tempStatusCodes);
                }

                function setArgumentValue(index, field, value) {
                    const tempArguments = [...argumentsArr];
                    tempArguments[index][field] = value;
                    setArguments(tempArguments);
                }

                function setParameterValue(index, field, value) {
                    const tempParameters = [...parameters];
                    tempParameters[index][field] = value;
                    setParameters(tempParameters);
                }

                function setHeaderValue(index, field, value) {
                    const tempHeaders = [...headers];
                    tempHeaders[index][field] = value;
                    setHeaders(tempHeaders);
                }

                async function getData() {
                    try {
                        const response = await axios.post(
                            "generate.php?get_data=1"
                        );

                        if (response.data.status == "success") {
                            setSections(response.data.sections);
                            setApis(response.data.apis);
                        } else {
                            swal.fire("Error", response.data.message, "error");
                        }
                    } catch (exp) {
                        swal.fire("Error", exp.message, "error");
                    }
                }

                async function addSection() {
                    setAddingSection(true);

                    const form = event.target;
                    const formData = new FormData(form);
                    formData.append("headers", JSON.stringify(headers));

                    try {
                        const response = await axios.post(
                            "generate.php?add_section=1",
                            formData
                        );

                        if (response.data.status == "success") {
                            const tempSections = [...sections];
                            tempSections.push(response.data.section);
                            setSections(tempSections);
                        } else {
                            swal.fire("Error", response.data.message, "error");
                        }
                    } catch (exp) {
                        swal.fire("Error", exp.message, "error");
                    } finally {
                        setAddingSection(false);
                    }
                }

                async function addAPI() {
                    setAddingAPI(true);

                    const form = event.target;
                    const formData = new FormData(form);
                    formData.append("headers", JSON.stringify(headers));
                    formData.append("parameters", JSON.stringify(parameters));
                    formData.append("arguments", JSON.stringify(argumentsArr));
                    formData.append("status_codes", JSON.stringify(statusCodes));

                    try {
                        const response = await axios.post(
                            "generate.php?add_api=1",
                            formData
                        );

                        if (response.data.status == "success") {
                            swal.fire("Add API", response.data.message, "success");
                        } else {
                            swal.fire("Error", response.data.message, "error");
                        }
                    } catch (exp) {
                        swal.fire("Error", exp.message, "error");
                    } finally {
                        setAddingAPI(false);
                    }
                }

                async function updateAPI() {
                    if (apiToEdit == null) {
                        return;
                    }

                    const form = event.target;
                    const formData = new FormData(form);
                    formData.append("id", apiToEdit.id);
                    formData.append("headers", JSON.stringify(apiToEdit.headers));
                    formData.append("parameters", JSON.stringify(apiToEdit.parameters));
                    formData.append("arguments", JSON.stringify(apiToEdit.arguments));
                    formData.append("status_codes", JSON.stringify(apiToEdit.responses));

                    form.submit.setAttribute("disabled", "disabled");

                    try {
                        const response = await axios.post(
                            "generate.php?update_api=1",
                            formData
                        );

                        if (response.data.status == "success") {
                            swal.fire("Update API", response.data.message, "success");
                        } else {
                            swal.fire("Error", response.data.message, "error");
                        }
                    } catch (exp) {
                        swal.fire("Error", exp.message, "error");
                    } finally {
                        form.submit.removeAttribute("disabled");
                    }
                }

                function deleteAPI(api) {
                    swal.fire({
                        title: "Delete API",
                        text: "Are you sure you want to delete the API \"" + api.name + "\"",
                        showCancelButton: true,
                        confirmButtonText: "Yes, Delete it !",
                    }).then(function (result) {
                        /* Read more about isConfirmed, isDenied below */
                        if (result.isConfirmed) {

                            setTimeout(async function () {
                                Swal.showLoading();

                                const formData = new FormData();
                                formData.append("id", api.id);

                                try {
                                    const response = await axios.post(
                                        "generate.php?delete_api=1",
                                        formData
                                    );

                                    if (response.data.status == "success") {
                                        swal.fire("Delete API", response.data.message, "success");

                                        const tempSections = [ ...sections ];
                                        let flag = false;
                                        for (let a = 0; a < tempSections.length; a++) {
                                            for (let b = 0; b < tempSections[a].apis.length; b++) {
                                                if (tempSections[a].apis[b].id == api.id) {
                                                    tempSections[a].apis.splice(b, 1);
                                                    flag = true;
                                                    break;
                                                }
                                            }
                                            if (flag) {
                                                break;
                                            }
                                        }
                                        setSections(tempSections);
                                    } else {
                                        swal.fire("Error", response.data.message, "error");
                                    }
                                } catch (exp) {
                                    swal.fire("Error", exp.message, "error");
                                } finally {
                                    Swal.hideLoading();
                                }
                            }, 500);
                        }
                    });
                }

                return (
                    <>
                        <div className="container mt-5 mb-5">
                            <div className="row">
                                <div className="offset-md-3 col-md-6">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h1 className="text-center">Generate API Documentation</h1>

                                            <h2 className="mt-5">Add New Section</h2>

                                            <form onSubmit={ function () {
                                                event.preventDefault();
                                                addSection();
                                            } }>
                                                <div className="form-group">
                                                    <label className="form-label">Name</label>
                                                    <input type="text" name="name" className="form-control" required />
                                                </div>

                                                <input type="submit" value="Add" className="btn btn-primary mt-3"
                                                    disabled={ addingSection } />
                                            </form>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12">
                                            <h2>Add New API Endpoint</h2>

                                            <form onSubmit={ function () {
                                                event.preventDefault();
                                                addAPI();
                                            } }>
                                                <div className="form-group mt-3 mb-3">
                                                    <label className="form-label">Section</label>
                                                    <select name="section_id" className="form-control" required>
                                                        { sections.map(function (section, index) {
                                                            return (
                                                                <option key={`section-option-${ index }`} value={ section.id }>{ section.name }</option>
                                                            );
                                                        }) }
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Name</label>
                                                    <input type="text" name="name" className="form-control" required />
                                                </div>

                                                <div className="form-group mt-3 mb-3">
                                                    <label className="form-label">Method</label>
                                                    <select name="method" className="form-control" required
                                                        defaultValue="post">
                                                        <option value="get">GET</option>
                                                        <option value="post">POST</option>
                                                        <option value="put">PUT</option>
                                                        <option value="patch">PATCH</option>
                                                        <option value="delete">DELETE</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Description</label>
                                                    <textarea name="description" className="form-control"></textarea>
                                                </div>

                                                <h3 className="mt-3 mb-3">Headers</h3>

                                                <table className="table table-bordered table-responsive">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Required</th>
                                                            <th>Description</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        { headers.map(function (header, index) {
                                                            return (
                                                                <tr key={ `header-${ index }` }>
                                                                    <td>
                                                                        <input type="text" value={ header.name } onChange={ function () {
                                                                            setHeaderValue(index, "name", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ header.required } onChange={ function () {
                                                                            setHeaderValue(index, "required", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ header.description } onChange={ function () {
                                                                            setHeaderValue(index, "description", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <button type="button" className="btn btn-danger" onClick={ function () {
                                                                            const tempHeaders = [...headers];
                                                                            tempHeaders.splice(index, 1);
                                                                            setHeaders(tempHeaders);
                                                                        } }>Remove</button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }) }
                                                    </tbody>
                                                </table>

                                                <button type="button" className="btn btn-primary" onClick={ function () {
                                                    const tempHeaders = [...headers];
                                                    tempHeaders.push({
                                                        name: "",
                                                        required: "Required",
                                                        description: ""
                                                    });
                                                    setHeaders(tempHeaders);
                                                } }>Add</button>

                                                <h3 className="mt-3 mb-3">Parameters</h3>

                                                <table className="table table-bordered table-responsive">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Type</th>
                                                            <th>Required</th>
                                                            <th>Description</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        { parameters.map(function (parameter, index) {
                                                            return (
                                                                <tr key={ `parameter-${ index }` }>
                                                                    <td>
                                                                        <input type="text" value={ parameter.name } onChange={ function () {
                                                                            setParameterValue(index, "name", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ parameter.type } onChange={ function () {
                                                                            setParameterValue(index, "type", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ parameter.required } onChange={ function () {
                                                                            setParameterValue(index, "required", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ parameter.description } onChange={ function () {
                                                                            setParameterValue(index, "description", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <button type="button" className="btn btn-danger" onClick={ function () {
                                                                            const tempParameters = [...parameters];
                                                                            tempParameters.splice(index, 1);
                                                                            setParameters(tempParameters);
                                                                        } }>Remove</button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }) }
                                                    </tbody>
                                                </table>

                                                <button type="button" className="btn btn-primary" onClick={ function () {
                                                    const tempParameters = [...parameters];
                                                    tempParameters.push({
                                                        name: "",
                                                        type: "string",
                                                        required: "Required",
                                                        description: ""
                                                    });
                                                    setParameters(tempParameters);
                                                } }>Add</button>

                                                <h3 className="mt-3 mb-3">Arguments</h3>

                                                <table className="table table-bordered table-responsive">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Type</th>
                                                            <th>Required</th>
                                                            <th>Description</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        { argumentsArr.map(function (argument, index) {
                                                            return (
                                                                <tr key={ `argument-${ index }` }>
                                                                    <td>
                                                                        <input type="text" value={ argument.name } onChange={ function () {
                                                                            setArgumentValue(index, "name", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ argument.type } onChange={ function () {
                                                                            setArgumentValue(index, "type", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ argument.required } onChange={ function () {
                                                                            setArgumentValue(index, "required", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ argument.description } onChange={ function () {
                                                                            setArgumentValue(index, "description", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <button type="button" className="btn btn-danger" onClick={ function () {
                                                                            const tempArguments = [...argumentsArr];
                                                                            tempArguments.splice(index, 1);
                                                                            setArguments(tempArguments);
                                                                        } }>Remove</button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }) }
                                                    </tbody>
                                                </table>

                                                <button type="button" className="btn btn-primary" onClick={ function () {
                                                    const tempArguments = [...argumentsArr];
                                                    tempArguments.push({
                                                        name: "",
                                                        type: "string",
                                                        required: "Required",
                                                        description: ""
                                                    });
                                                    setArguments(tempArguments);
                                                } }>Add</button>

                                                <div className="form-group mt-3 mb-3">
                                                    <label className="form-label">Example Request</label>
                                                    <textarea name="example_request" className="form-control" rows="10"></textarea>
                                                </div>

                                                <h3 className="mt-3 mb-3">Status Codes</h3>

                                                <table className="table table-bordered table-responsive">
                                                    <thead>
                                                        <tr>
                                                            <th>Status</th>
                                                            <th>Text</th>
                                                            <th>Response</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        { statusCodes.map(function (statusCode, index) {
                                                            return (
                                                                <tr key={ `status-code-${ index }` }>
                                                                    <td>
                                                                        <input type="text" value={ statusCode.status } onChange={ function () {
                                                                            setStatusCodeValue(index, "status", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" value={ statusCode.status_text } onChange={ function () {
                                                                            setStatusCodeValue(index, "status_text", event.target.value);
                                                                        } }
                                                                            className="form-control" />
                                                                    </td>

                                                                    <td>
                                                                        <textarea value={ statusCode.response } onChange={ function () {
                                                                            setStatusCodeValue(index, "response", event.target.value);
                                                                        } }
                                                                            className="form-control"></textarea>
                                                                    </td>

                                                                    <td>
                                                                        <button type="button" className="btn btn-danger" onClick={ function () {
                                                                            const tempStatusCodes = [...statusCodes];
                                                                            tempStatusCodes.splice(index, 1);
                                                                            setStatusCodes(tempStatusCodes);
                                                                        } }>Remove</button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }) }
                                                    </tbody>
                                                </table>

                                                <button type="button" className="btn btn-primary" onClick={ function () {
                                                    const tempStatusCodes = [...statusCodes];
                                                    tempStatusCodes.push({
                                                        status: "200 OK",
                                                        status_text: "Request successful.",
                                                        response: "",
                                                    });
                                                    setStatusCodes(tempStatusCodes);
                                                } }>Add</button>

                                                <br />

                                                <input type="submit" value="Add API" className="btn btn-success mt-3"
                                                    disabled={ addingAPI } />
                                            </form>
                                        </div>
                                    </div>

                                    <div className="row mt-5">
                                        <div className="col-md-12">

                                            { sections.map(function (section, index) {
                                                return (
                                                    <React.Fragment key={ `data-section-${ index }` }>
                                                        <h2 id={ section.name }>{ section.name }</h2>

                                                        { section.apis.map(function (api, apiIndex) {
                                                            return (
                                                                <details key={ `data-api-${ apiIndex }` } id={ `${ section.name } - ${ api.name }` }>
                                                                    <summary>{ `${ api.method.toUpperCase() } ${ api.name }` }</summary>
                                                                    
                                                                    <div className="mt-3 mb-3">
                                                                        <button type="button" className="btn btn-warning"
                                                                            onClick={ function () {
                                                                                const tempAPI = { ...api };
                                                                                tempAPI.sectionId = section.id;
                                                                                setApiToEdit(tempAPI);
                                                                                $("#modal-edit-api").modal("show");
                                                                            } }>Edit</button>

                                                                        &nbsp;<button type="button" className="btn btn-danger"
                                                                            onClick={ function () {
                                                                                deleteAPI(api);
                                                                            } }>Delete</button>
                                                                    </div>

                                                                    <p><strong>Description:</strong> { api.description }</p>

                                                                    { (api.headers.length > 0) && (
                                                                        <>
                                                                            <h3>Headers</h3>

                                                                            <table>
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Name</th>
                                                                                        <th>Required</th>
                                                                                        <th>Description</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    { api.headers.map(function (header, headerIndex) {
                                                                                        return (
                                                                                            <tr key={ `data-header-${ headerIndex }` }>
                                                                                                <td>{ header.name }</td>
                                                                                                <td>{ header.required }</td>
                                                                                                <td>{ header.description }</td>
                                                                                            </tr>
                                                                                        );
                                                                                    }) }
                                                                                </tbody>
                                                                            </table>
                                                                        </>
                                                                    ) }

                                                                    { (api.arguments.length > 0) && (
                                                                        <>
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
                                                                                    { api.arguments.map(function (argument, argumentIndex) {
                                                                                        return (
                                                                                            <tr key={ `data-argument-${ argumentIndex }` }>
                                                                                                <td>{ argument.name }</td>
                                                                                                <td>{ argument.type }</td>
                                                                                                <td>{ argument.required }</td>
                                                                                                <td>{ argument.description }</td>
                                                                                            </tr>
                                                                                        );
                                                                                    }) }
                                                                                </tbody>
                                                                            </table>
                                                                        </>
                                                                    ) }

                                                                    { (api.example_request) != "" && (
                                                                        <>
                                                                            <h3>Example Request</h3>
                                                                            <pre><code>{ api.example_request }</code></pre>
                                                                        </>
                                                                    ) }

                                                                    { (api.responses.length > 0) && (
                                                                        <>
                                                                            <h3>Status Codes</h3>
                                                                            { api.responses.map(function (response, responseIndex) {
                                                                                return (
                                                                                    <React.Fragment key={ `data-response-${ responseIndex }` }>
                                                                                        <ul>
                                                                                            <li><strong>{ response.status }:</strong> { response.status_text }</li>
                                                                                        </ul>

                                                                                        <h3>Response</h3>
                                                                                        <pre><code>{ response.response }</code></pre>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }) }
                                                                        </>
                                                                    ) }
                                                                </details>
                                                            );
                                                        }) }
                                                    </React.Fragment>
                                                );
                                            }) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal fade" id="modal-edit-api">
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Edit API</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>

                                    <div className="modal-body">
                                        { apiToEdit != null && (
                                            <>
                                                <form onSubmit={ function () {
                                                    event.preventDefault();
                                                    updateAPI();
                                                } } id="form-update-api">
                                                    <div className="form-group mb-3">
                                                        <label className="form-label">Section</label>
                                                        <select name="section_id" className="form-control" required
                                                            defaultValue={ apiToEdit.sectionId }>
                                                            { sections.map(function (section, index) {
                                                                return (
                                                                    <option key={`apiToEdit-section-option-${ index }`}
                                                                        value={ section.id }>{ section.name }</option>
                                                                );
                                                            }) }
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">Name</label>
                                                        <input type="text" name="name" value={ apiToEdit.name } onChange={ function () {
                                                            const tempApi = { ...apiToEdit };
                                                            tempApi.name = event.target.value;
                                                            setApiToEdit(tempApi);
                                                        } } className="form-control" required />
                                                    </div>

                                                    <div className="form-group mt-3 mb-3">
                                                        <label className="form-label">Method</label>
                                                        <select name="method" className="form-control" required
                                                            defaultValue={ apiToEdit.method ?? "post" }>
                                                            <option value="get">GET</option>
                                                            <option value="post">POST</option>
                                                            <option value="put">PUT</option>
                                                            <option value="patch">PATCH</option>
                                                            <option value="delete">DELETE</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">Description</label>
                                                        <textarea name="description" className="form-control" value={ apiToEdit.description } onChange={ function () {
                                                            const tempApi = { ...apiToEdit };
                                                            tempApi.description = event.target.value;
                                                            setApiToEdit(tempApi);
                                                        } }></textarea>
                                                    </div>

                                                    <h3 className="mt-3 mb-3">Headers</h3>

                                                    <table className="table table-bordered table-responsive">
                                                        <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Required</th>
                                                                <th>Description</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            { apiToEdit.headers.map(function (header, index) {
                                                                return (
                                                                    <tr key={ `apiToEdit-header-${ index }` }>
                                                                        <td>
                                                                            <input type="text" value={ header.name } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.headers[index].name = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ header.required } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.headers[index].required = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ header.description } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.headers[index].description = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <button type="button" className="btn btn-danger" onClick={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.headers.splice(index, 1);
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }>Remove</button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }) }
                                                        </tbody>
                                                    </table>

                                                    <button type="button" className="btn btn-primary" onClick={ function () {
                                                        const tempApiToEdit = { ...apiToEdit };
                                                        tempApiToEdit.headers.push({
                                                            name: "",
                                                            required: "Required",
                                                            description: ""
                                                        });
                                                        setApiToEdit(tempApiToEdit);
                                                    } }>Add</button>

                                                    <h3 className="mt-3 mb-3">Parameters</h3>

                                                    <table className="table table-bordered table-responsive">
                                                        <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Type</th>
                                                                <th>Required</th>
                                                                <th>Description</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            { apiToEdit.parameters.map(function (parameter, index) {
                                                                return (
                                                                    <tr key={ `apiToEdit-parameter-${ index }` }>
                                                                        <td>
                                                                            <input type="text" value={ parameter.name } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.parameters[index].name = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ parameter.type } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.parameters[index].type = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ parameter.required } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.parameters[index].required = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ parameter.description } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.parameters[index].description = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <button type="button" className="btn btn-danger" onClick={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.parameters.splice(index, 1);
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }>Remove</button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }) }
                                                        </tbody>
                                                    </table>

                                                    <button type="button" className="btn btn-primary" onClick={ function () {
                                                        const tempApiToEdit = { ...apiToEdit };
                                                        tempApiToEdit.parameters.push({
                                                            name: "",
                                                            type: "string",
                                                            required: "Required",
                                                            description: ""
                                                        });
                                                        setApiToEdit(tempApiToEdit);
                                                    } }>Add</button>

                                                    <h3 className="mt-3 mb-3">Arguments</h3>

                                                    <table className="table table-bordered table-responsive">
                                                        <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Type</th>
                                                                <th>Required</th>
                                                                <th>Description</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            { apiToEdit.arguments.map(function (argument, index) {
                                                                return (
                                                                    <tr key={ `apiToEdit-argument-${ index }` }>
                                                                        <td>
                                                                            <input type="text" value={ argument.name } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.arguments[index].name = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ argument.type } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.arguments[index].type = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ argument.required } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.arguments[index].required = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ argument.description } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.arguments[index].description = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <button type="button" className="btn btn-danger" onClick={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.arguments.splice(index, 1);
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }>Remove</button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }) }
                                                        </tbody>
                                                    </table>

                                                    <button type="button" className="btn btn-primary" onClick={ function () {
                                                        const tempApiToEdit = { ...apiToEdit };
                                                        tempApiToEdit.arguments.push({
                                                            name: "",
                                                            type: "string",
                                                            required: "Required",
                                                            description: ""
                                                        });
                                                        setApiToEdit(tempApiToEdit);
                                                    } }>Add</button>

                                                    <div className="form-group mt-3 mb-3">
                                                        <label className="form-label">Example Request</label>
                                                        <textarea name="example_request" className="form-control" rows="10" value={ apiToEdit.example_request } onChange={ function () {
                                                            const tempApiToEdit = { ...apiToEdit };
                                                            tempApiToEdit.example_request = event.target.value;
                                                            setApiToEdit(tempApiToEdit);
                                                        } }></textarea>
                                                    </div>

                                                    <h3 className="mt-3 mb-3">Status Codes</h3>

                                                    <table className="table table-bordered table-responsive">
                                                        <thead>
                                                            <tr>
                                                                <th>Status</th>
                                                                <th>Text</th>
                                                                <th>Response</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            { apiToEdit.responses.map(function (statusCode, index) {
                                                                return (
                                                                    <tr key={ `apiToEdit-status-code-${ index }` }>
                                                                        <td>
                                                                            <input type="text" value={ statusCode.status } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.responses[index].status = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <input type="text" value={ statusCode.status_text } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.responses[index].status_text = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control" />
                                                                        </td>

                                                                        <td>
                                                                            <textarea value={ statusCode.response } onChange={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.responses[index].response = event.target.value;
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }
                                                                                className="form-control"></textarea>
                                                                        </td>

                                                                        <td>
                                                                            <button type="button" className="btn btn-danger" onClick={ function () {
                                                                                const tempApiToEdit = { ...apiToEdit };
                                                                                tempApiToEdit.responses.splice(index, 1);
                                                                                setApiToEdit(tempApiToEdit);
                                                                            } }>Remove</button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }) }
                                                        </tbody>
                                                    </table>

                                                    <button type="button" className="btn btn-primary" onClick={ function () {
                                                        const tempApiToEdit = { ...apiToEdit };
                                                        tempApiToEdit.responses.push({
                                                            status: "200 OK",
                                                            status_text: "Request successful.",
                                                            response: "",
                                                        });
                                                        setApiToEdit(tempApiToEdit);
                                                    } }>Add</button>
                                                </form>
                                            </>
                                        ) }
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        <button type="submit" className="btn btn-success" form="form-update-api" name="submit">Save changes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            }

            ReactDOM.createRoot(
                document.getElementById("app")
            ).render(<App />);
        </script>
    </body>
</html>