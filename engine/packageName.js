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

const getPackageNameInfo = async (name) => {
    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.goto(`https://registry.npmjs.org/${name}`);
        const response = await page.content();
        // console.log(`response: ${response}`);
        await browser.close();
        if (response.includes("Not found")) {
            return {
                success: true,
                message: `${name} is available for use as a node package name`,
            };
        } else {
            return {
                success: false,
                message: `${name} is NOT available for use as a node package name`,
            };
        }
    } catch (error) {
        console.log(error);
    }
  
};

module.exports.getPackageNameInfo = getPackageNameInfo;
