Main Customized files:
- `/imports/plugins/custom/**`
 - `/imports/plugins/custom/width-height-variant`  <-- majority of logic is here
- `/imports/plugins/included/product-detail-simple/**`
- `/imports/plugins/included/product-variant/**`
 - `/imports/plugins/included/product-variant/containers/variantFormContainer.js `

 * These files need to be updated for RC 1.5.7 *
 - Compare these listed files above (in the `custom-cart_rc1.5.7-0` branch or later) to the `custom-cart_rc1.3.0` branch:
  - https://github.com/MassDistributionMedia/rc-ca-blinds/blob/custom-cart_rc1.3.0/imports/plugins/included/product-detail-simple/client/containers/variantListContainer.js


To look up all non-template .json files:
*.json, -package.json, -ar.json, -bg.json, -cd.json, -de.json, -en.json,-es.json, -cs.json, -el.json,-fr.json, -he.json, -hr.json, -hu.json, -it.json, -.my.json, -nb.json, -nl.json, -pl.json, -my.json, -pt.json, -ro.json, -ru.json, -sl.json, -sv.jon, -sv.json, -tr.json, -vi.json, -vi.json, -zh.json, -bower.json, -typings.json, -/node_modules/**/*.json


Access Meteor Mongo:
`$ meteor mongo`


`createVariant` definition:
https://github.com/reactioncommerce/reaction/blob/1eec469f19f765c1ca7f45bfe0e6bf39177e64f1/server/methods/catalog.js#L396


Custom Product Details Page:
- selected Variant doesn't change routing info
- varients selected are added to a list
- you can only add to cart once all parts have completed
- Add to cart creates a new variant which will be the sum of the parts


# Cart/Shipping Hack
- Shipping charges will be $3.00 per shade with a $12.00 Minimum for any size blinds/shade that I offer on the website for anywhere in US except Alaska and Hawaii.
So, for 1 shades its $12.00.  For 4 Shades its $12.00.  For 5 Shades its $15.00.
- /lib/collections/transform/cart.js#51 is where I'd do the hack