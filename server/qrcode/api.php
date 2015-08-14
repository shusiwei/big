<?php
include "phpqrcode.php";

$root = $_SERVER["DOCUMENT_ROOT"].'/server/';
$path = 'upload/qrcode/';
$uploadPath = $root.$path;
$logoPath = $root.'qrcode/logo/';
$version = 2;
$wechat = 'http://weixin.qq.com/r/';

$callback = $_GET["callback"];
$text = $_GET["text"];
$matrixPointSize = $_GET["size"];
$errorCorrectionLevel = "H";

$file_name = '_'.$matrixPointSize.'_'.$version;

function getURL($path, $root, $callback) {
    $url = substr($path, strlen($root));
    return $callback.'('.json_encode($url).')';
};

if (strpos($text, $wechat) !== false && $matrixPointSize != 1) {
    $name = substr($text, strlen($wechat));
    $temp_qr_path = $uploadPath.'temp/'.$name.$file_name.'_temp.png';
    $logo_qr_path = $uploadPath.'logo/'.$name.$file_name.'.png';

    if (file_exists($logo_qr_path)) {
        echo(getURL($logo_qr_path, $root, $callback));
        exit();
    } else {
        $qrcode = QRcode::png($text, $temp_qr_path, $errorCorrectionLevel, $matrixPointSize, 0);
        $logo_file = $logoPath.$name.'.png';

        $temp_qr = imagecreatefrompng($temp_qr_path);
        $temp_logo = imagecreatefrompng($logo_file);

        if ($temp_logo) {
            $qr_width = imagesx($temp_qr);//二维码图片宽度
            $qr_height = imagesy($temp_qr);//二维码图片高度
            $logo_width = imagesx($temp_logo);//logo图片宽度
            $logo_height = imagesy($temp_logo);//logo图片高度

            //创建新二维码
            $new_qr_width = $qr_width;
            $new_qr_height = $qr_height;
            $new_qr = imagecreatetruecolor($new_qr_width, $new_qr_height);
            $new_qr_alpha = imagecolorallocatealpha($new_qr, 0, 0, 0, 127);
            imagefill($new_qr, 0, 0, $new_qr_alpha);
            imagecopyresampled($new_qr, $temp_qr, 0, 0, 0, 0, $new_qr_width, $new_qr_height, $qr_width, $qr_height);
            imagesavealpha($new_qr, true);

            //创建新Logo
            $new_logo_width = $logo_width;
            $new_logo_height = $logo_height;
            $new_logo = imagecreatetruecolor($new_logo_width, $new_logo_height);
            $new_logo_alpha = imagecolorallocatealpha($new_logo, 0, 0, 0, 127);
            imagefill($new_logo, 0, 0, $new_logo_alpha);
            imagecopyresampled($new_logo, $temp_logo, 0, 0, 0, 0, $new_logo_width, $new_logo_height, $logo_width, $logo_height);
            imagesavealpha($new_logo, true);

            // 生成最终图片
            $scale = 110 / 300;
            $logo_qr_width = round($qr_width * $scale);   
            $logo_qr_height = round($qr_width * $scale);   
            $from_position = ($qr_width - $logo_qr_width) / 2;
            // 合并二维码及头像
            imagecopyresampled($new_qr, $new_logo, $from_position, $from_position, 0, 0, $logo_qr_width, $logo_qr_height, $logo_width, $logo_height);
            imagepng($new_qr, $logo_qr_path);

            imagedestroy($new_logo);
            imagedestroy($new_qr);

            unlink($temp_qr_path);

            echo(getURL($logo_qr_path, $root, $callback));
            exit();
        } else {
            echo(getURL($temp_qr_path, $root, $callback));
            exit();
        };
    };
} else {
    $name = md5($text);
    $nologo_qr_path = $uploadPath.'nologo/'.$name.$file_name.'.png';

    if (!file_exists($nologo_qr_path)) {
        $qrcode = QRcode::png($text, $nologo_qr_path, $errorCorrectionLevel, $matrixPointSize, 0);
    };

    echo(getURL($nologo_qr_path, $root, $callback));
    exit();
};

exit();
?>