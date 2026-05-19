import { browserService } from "./browser.service.js"


async function main(){

    const b = await browserService.getBrowser()
    console.log("Browser listo:", b.isConnected())
    await browserService.close()

}
main()