

import { Hono } from 'hono'
import { cors } from 'hono/cors';
import userRoutes from "../routes/userRoutes"
import propertyRoutes from "../routes/PropertiesRoutes"
const app = new Hono();
app.use(cors());
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route("/user",userRoutes
)
app.route("/property",propertyRoutes)


export default app
