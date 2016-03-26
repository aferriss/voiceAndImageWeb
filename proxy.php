<?php
// PHP Proxy
// Responds to both HTTP GET and POST requests
//
// Author: Abdul Qabiz
// March 31st, 2006
//

// Get the url of to be proxied
// Is it a POST or a GET?
function post($key){
	if(isset($_POST[$key]))
		return $_POST[$key];
	return false;
}

function get($key){
	if(isset($_GET[$key]))
		return $_GET[$key];
	return false;
}

$url = get('url');
$headers = get('headers');
$mimeType = get('mimeType');

// if(isset($_POST['url']) || isset($_GET['url'])) {
// 	$url = ($_POST['url']) ? $_POST['url'] : $_GET['url'];
// }
// if(isset($_POST['headers']) || isset($_GET['headers'])) {
// 	$headers = ($_POST['headers']) ? $_POST['headers'] : $_GET['headers'];
// }
// if(isset($_POST['mimeType']) || isset($_GET['mimeType'])) {
// 	$mimeType =($_POST['mimeType']) ? $_POST['mimeType'] : $_GET['mimeType'];
// }


//Start the Curl session
$session = curl_init($url);

// If it's a POST, put the POST data in the body
// if (isset($_POST['url'])) {
// 	$postvars = '';
// 	while ($element = current($_POST)) {
// 		$postvars .= key($_POST).'='.$element.'&';
// 		next($_POST);
// 	}
// 	curl_setopt($session, CURLOPT_URL, $_POST['url']);
// 	curl_setopt ($session, CURLOPT_POST, true);
// 	curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
// }

// Don't return HTTP headers. Do return the contents of the call
curl_setopt($session, CURLOPT_HEADER, ($headers == "true") ? true : false);

curl_setopt($session, CURLOPT_FOLLOWLOCATION, true); 
//curl_setopt($ch, CURLOPT_TIMEOUT, 4); 
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

// Make the call
$response = curl_exec($session);

if ($mimeType != "")
{
	// The web service returns XML. Set the Content-Type appropriately
	header("Content-Type: ".$mimeType);
}

echo $response;

curl_close($session);

?>
