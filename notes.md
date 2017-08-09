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