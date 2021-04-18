const fs = require("fs");
const fetch = require("node-fetch");

/*Parse category page, should add url parameter*/

const scraperObject = {
	async scraper(browser){
		let page = await browser.newPage();
		console.log(`Navigating to ${this.url}...`);
		await page.goto(this.url);

		// Wait for the required DOM to be rendered
		await page.waitForSelector('#products-list');
		// Get the link to all the required books


		function download(url, filename){
			return fetch(url)
				.then(res => {
					const dest = fs.createWriteStream(filename);
					res.body.pipe(dest)
				})
				.catch((err) => {
					console.log(err)
				})
		}


		let products = await page.$$eval('#products-list > .item', products => {

			/* https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer */
			//  This is main download function which takes the url of your image

			// function download(uri, filename) {
			// 	return new Promise((resolve, reject) => {
			// 		request.head(uri, function (err, res, body) {
			// 			request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
			// 		});
			// 	});
			// }

			function replaceBreak(string) {
				return string.replace(/\n/g, " ");
			}

			products = products.map((product) => {
				const data = {};

				/*Required*/
				const id = product.querySelector('.product-id span').innerText;
				const title = product.querySelector('.product-name a').innerText;
				const price = product.querySelector('.price').innerText;
				const deliveryType = product.querySelector('.delivery-type').innerText;
				const specification = Array.from(product.querySelectorAll('.product-specs ul > li')).map(el=>el.innerText);
				const characteristics = Array.from(product.querySelectorAll('.product-characteristics > li')).map(el=>({
					name: el.querySelector('.name').innerText.trim(),
					value: el.querySelector('.value').innerText.trim(),
				}));
				const imageSrc = product.querySelector('.product-image-wrapper img').readAttribute("src");

				/*Not required*/
				let label = product.querySelector('.b-label');

				// download(imageDownload, imageSrc);

				/*Required*/
				id && (data.id = id.trim());
				title && (data.title = title.trim());
				price && (data.price = replaceBreak(price.trim()));
				deliveryType && (data.deliveryType = replaceBreak(deliveryType));
				specification && (data.specification = specification);
				characteristics && (data.characteristics = characteristics);
				imageSrc && (data.imageSrc = imageSrc);
				// imageDownload && (data.imageSrc = imageSrc);

				/*Not required*/
				label && label.innerText && (data.label = label.innerText.trim());

				// console.log("product", product);

				return data;
			})


			return products;
		});


		// products = Promise.all(products.map(product => download(product.imageSrc, `./images/${product.imageSrc.split("/").pop()}`)))

		console.log(products);

	}
}

module.exports = scraperObject;