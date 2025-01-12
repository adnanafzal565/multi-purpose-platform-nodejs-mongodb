<?php
    $pdo = new PDO("mysql:host=localhost; dbname=api_docs;", "root", "root", [
        PDO::ATTR_PERSISTENT => true
    ]);

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

    // print_r($sections);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <title>Node JS and Mongo DB API Documentation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
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
    <div class="container">
        <h1>Node JS and Mongo DB API Documentation</h1>
		
		<p><b>Base URL:</b> http://localhost:3000</p>

        <?php foreach ($sections as $section): ?>
            <h2 id="<?php echo $section->name; ?>"><?php echo $section->name; ?></h2>

            <?php foreach ($section->apis as $api): ?>
                <details id="<?php echo $section->name . '-' . $api->name; ?>">
                    <summary><?php echo strtoupper($api->method) . ' ' . $api->name; ?></summary>
                    <p><strong>Description:</strong> <?php echo $api->description; ?></p>

                    <?php if (count($api->headers) > 0): ?>
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
                                <?php foreach ($api->headers as $header): ?>
                                    <tr>
                                        <td><?php echo $header->name; ?></td>
                                        <td><?php echo $header->required; ?></td>
                                        <td><?php echo $header->description; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>

                    <?php if (count($api->parameters) > 0): ?>
                        <h3>Parameters</h3>
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
                                <?php foreach ($api->parameters as $parameter): ?>
                                    <tr>
                                        <td><?php echo $parameter->name; ?></td>
                                        <td><?php echo $parameter->type; ?></td>
                                        <td><?php echo $parameter->required; ?></td>
                                        <td><?php echo $parameter->description; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>

                    <?php if (count($api->arguments) > 0): ?>
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
                                <?php foreach ($api->arguments as $argument): ?>
                                    <tr>
                                        <td><?php echo $argument->name; ?></td>
                                        <td><?php echo $argument->type; ?></td>
                                        <td><?php echo $argument->required; ?></td>
                                        <td><?php echo $argument->description; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>

                    <?php if (!empty($api->example_request)): ?>
                        <h3>Example Request</h3>
                        <pre><code><?php echo $api->example_request; ?></code></pre>
                    <?php endif; ?>

                    <?php if (count($api->responses) > 0): ?>
                        <h3>Status Codes</h3>
                        <?php foreach ($api->responses as $response): ?>
                            <ul>
                                <li><strong><?php echo $response->status; ?>:</strong> <?php echo $response->status_text; ?></li>
                            </ul>

                            <h3>Response</h3>
                            <pre><code><?php echo $response->response; ?></code></pre>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </details>
            <?php endforeach; ?>
        <?php endforeach; ?>

    </div>
</body>
</html>
