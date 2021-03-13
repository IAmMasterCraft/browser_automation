const puppeteer = require("puppeteer");
//manage validNotAssigned
const validNotAssigned = (bodyContent, plateNumber) => {
  if (bodyContent.toString().includes("Validated")) {
    return {
      plate_number: plateNumber,
      vehicle_make: null,
      vehicle_color: null,
      status: "valid",
      assigned: "false",
    };
  }
  return false;
};

const validAndAssigned = (bodyContent, plateNumber) => {
  if (bodyContent.includes("Valid and assigned to the vehicle details below")) {
    const result = bodyContent.split("<tbody>")[1].split("</tbody>")[0];
    return getObj(stripTag(result), plateNumber);
  }
  return false;
};

const stripTag = (htmlContent) => {
  const regexTag = /(<([^>]+)>)/gi;
  const regexSpace = /\s+/g;
  const filtered = htmlContent.replace(regexTag, "").replace(regexSpace, "");
  const spaced = filtered
    .split("")
    .map((char, index) =>
      char.toUpperCase() === char && index !== 0 ? ` ${char}` : char
    );
  return spaced.join("");
};

const getObj = (plateInfo, plateNumber) => {
  const vMake = plateInfo.split("Vehicle Make ")[1].split(" Vehicle Color ")[0];
  const vColor = plateInfo.split(" Vehicle Color ")[1];
  return {
    plate_number: plateNumber,
    vehicle_make: vMake,
    vehicle_color: vColor,
    status: "valid",
    assigned: true,
  };
};

const getNumberInfo = async (plateNumber) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://nvis.frsc.gov.ng/VehicleManagement/VerifyPlateNo");
  await page.type(".form-control", plateNumber);
  await page.keyboard.press("Enter");
  await page.waitForNavigation();
  const finalResponse = validNotAssigned(await page.content(), plateNumber);
  const finalResponse2 = validAndAssigned(await page.content(), plateNumber);
  console.log(finalResponse);
  console.log(finalResponse2);
  await browser.close();
  if (finalResponse) {
    return finalResponse;
  } else if (finalResponse2) {
    return finalResponse2;
  } else {
    return {
      plate_number: plateNumber,
      vehicle_make: null,
      vehicle_color: null,
      status: null,
      assigned: null,
    };
  }
};

module.exports.getNumberInfo = getNumberInfo;
