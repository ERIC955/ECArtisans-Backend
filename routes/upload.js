const express = require('express');
const router = express.Router();

const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');

const isAuth = require('../middlewares/isAuth');
const upload = require('../middlewares/image');

const { v4: uuidv4 } = require('uuid');
const firebaseAdmin = require('../service/firebase');
const bucket = firebaseAdmin.storage().bucket();

router.post(
	'/file',
	isAuth,
	upload,
	handleErrorAsync(async (req, res, next) => {
		if (!req.files.length) {
			return next(appError(400, '尚未上傳檔案', next));
		}
		// 取得上傳的檔案資訊列表裡面的第一個檔案
		const file = req.files[0];
		// 基於檔案的原始名稱建立一個 blob 物件
		const blob = bucket.file(
			`images/${uuidv4()}.${file.originalname.split('.').pop()}`
		);
		// 建立一個可以寫入 blob 的物件
		const blobStream = blob.createWriteStream({
			metadata: {
				contentType: file.mimetype,
			},
		});

		// 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
		blobStream.on('finish', () => {
			// 設定檔案的存取權限
			const config = {
				action: 'read', // 權限
				expires: '12-31-2500', // 網址的有效期限
			};
			// 取得檔案的網址
			blob.getSignedUrl(config, (err, fileUrl) => {
				res.status(200).json({
					status: true,
					message: '圖片上傳成功啦~ (ﾉ >ω<)ﾉ',
					fileUrl,
				});
			});
		});

		// 如果上傳過程中發生錯誤，會觸發 error 事件
		blobStream.on('error', (err) => {
			res.status(500).json({
				status: false,
				message: '上傳失敗了，只能請您重新上傳一次(˘•ω•˘)',
			});
		});
		// 將檔案的 buffer 寫入 blobStream
		blobStream.end(file.buffer);
	})
);

module.exports = router;
