
### How the current code works
- When logged into the Reaction Commerce app as the admin,
 - if a product is created with a variant type "Height & Width",
 - when the server is then restarted, /imports/plugins/custom/width-height-variant/server/startup.js will
 - create 188 product variants from this speadsheet:
  - https://docs.google.com/spreadsheets/d/1O_cHpt_CDSa_hfy2I7GAdPq--nFQRukiicX00oNSwcw/edit#gid=1417458915
  - The files of interest are:
   - /imports/plugins/custom/width-height-variant/server/startup.js (React.js)
   - /imports/plugins/custom/width-height-variant/client/render-list.js (React.js)
   - /imports/plugins/included/product-detail-simple/client/components/variantList.js (React.js)
   - Latest code is the mikeDev branch.

### OnDemand Variant Creation Idea
- so that there isn't hundreds of variants for the system to handle
- A user lands on a product detail page ->
  - If the variant they select hasn't been created yet, create it
  - Keep a que of ten or so of the last or most popular created variants



_ _ _




### Old Pricing Calculator Idea, DO NO IMPLEMENT
OptionVariant
- has a series of options which independently modify the end price

Option
- A number of modifiable form inputs that will result in a price change
- A number of dependencies which will modify how
- A function to act as the Calculator to find out its net price
- Each option doesn't know the price of other options
    - Only knows the key:value





