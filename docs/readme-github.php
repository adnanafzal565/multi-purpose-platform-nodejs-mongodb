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

    $html = "";
    foreach ($sections as $section)
    {
        $html .= "### " . $section->name . "

";
        foreach ($section->apis as $api)
        {
            $html .= "<details>
  <summary><b>" . (strtoupper($api->method) ?? "") . " " . ($api->name ?? "") . "</b></summary>

**Description:** " . ($api->description ?? "") . "
";

if (count($api->headers) > 0)
{
    $html .= "### Headers
";
}

    foreach ($api->headers as $header)
    {
        $html .= "- **" . ($header->name ?? "") . ":** " . ($header->required ?? "") . ". " . ($header->description ?? "") . "
";
    }

if (count($api->parameters) > 0)
{
    $html .= "### Parameters
";
}

    foreach ($api->parameters as $parameter)
    {
        $html .= "- **" . ($parameter->name ?? "") . "** (" . ($parameter->type ?? "") . "): " . ($parameter->required ?? "") . ". " . ($parameter->description ?? "") . "
";
    }

    if (count($api->arguments) > 0)
{
    $html .= "### Arguments
";
}

    foreach ($api->arguments as $argument)
    {
        $html .= "- **" . ($argument->name ?? "") . "** (" . ($argument->type ?? "") . "): " . ($argument->required ?? "") . ". " . ($argument->description ?? "") . "
";
    }

    if (!empty($api->example_request))
    {
        $html .= "### Example Request
```bash
" . ($api->example_request ?? "") . "
```
";
    }

    if (count($api->responses) > 0)
    {
        $html .= "### Status Codes
";
    }

    foreach ($api->responses as $response)
    {
        $html .= "- **" . ($response->status ?? "") . ":** " . ($response->status_text ?? "") . "

### Response

```json
" . ($response->response ?? "") . "
```
";
    }

    $html .= "</details>

";
}
    }

    echo $html;

?>