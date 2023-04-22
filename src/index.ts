const { Command } = require("commander");
const figlet = require("figlet");

const program = new Command();

console.log(figlet.textSync("Propine Helper"));

program
  .version("1.0.0")
  .description("CLI application aims to compute the portfolio of crypto investor based on the input parameters")
  .option("-t, --token [value]", "Given a token, return the latest portfolio value for that token in USD")
  .option("-d, --date [value]", "Given a date, return the portfolio value per token in USD on that date")
  .parse(process.argv);

const opts = program.opts();
if (opts.token) console.log(`token: ${opts.token}`);
if (opts.date) console.log(`date: ${opts.date}`);