# (1) Swagger API

https://swagger.io/docs/specification/basic-structure/
https://swagger.io/docs/specification/data-models/data-types/
https://swagger.io/docs/specification/adding-examples/
https://swagger.io/docs/specification/authentication/bearer-authentication/

https://editor.swagger.io/?_gl=1*mogv8*_gcl_au*MzA2ODUyMTczLjE3MTQzOTk2MTA.&_ga=2.177703841.582691157.1717503507-1575908821.1714399610

1. install swagger ui

```sh
npm install swagger-jsdoc swagger-ui-express
```

2. create a file 'swaggerConfig.js' or add to 'index.js'

```js
import swaggerJsdoc from 'swagger-jsdoc'

const swaggerOption = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Documentation - OpenAPI 3.0',
      version: '1.0.11',
      description: 'A simple API documentation',
    },
    servers: [
      {
        url: 'http://localhost:8000',
      },
    ],
    // Add Authorization with Bearer <token>
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['index.js'],
}
export const swaggerSpec = swaggerJsdoc(swaggerOption)
```

3. add middleware 'index.js'

```js
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swaggerConfig.js'

// app.use(cors())

if (process.env.NODE_ENV != 'production') {
  app.get('/', (req, res) => res.redirect('api-docs'))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
```

## (1.1) Add Swagger to HTTP request

1. Example: POST /api/create

```js
/**
 * @swagger
 * /api/product:
 *    post:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Add a new product to the stock
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *        required: true
 *      responses:
 *        201:
 *          description: Create
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        400:
 *          description: Bad request
 *        401:
 *          description: Unauthorized
 */
```

2. Example: GET /api/read

```js
/**
 * @swagger
 * /api/product:
 *    get:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Get All Products
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
```

3. Example: GET /api/read/{id}

```js
/**
 * @swagger
 * /api/product/read/{id}:
 *    get:
 *      tags: [Product]
 *      summary: Get Product By ID
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
```

4. Example: PUT /api/update

```js
/**
 * @swagger
 * /api/product:
 *    put:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Update Product
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        400:
 *          description: Bed request
 *        401:
 *          description: Unauthorized
 */
```

5. Example: DELETE /api/delete/{id}

```js
/**
 * @swagger
 * /api/product/{id}:
 *    delete:
 *      tags: [Product]
 *      security:
 *        - bearerAuth: []
 *      summary: Delete Product By ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID of the product to delete
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not found
 */
```

### (1.1.1) Add Swagger to Components

```js
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - price
 *         - cost
 *         - stock_quantity
 *         - date_added
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id
 *           example: "66238c86a0f9c66406e2e036"
 *         code:
 *           type: string
 *           example: "A2"
 *         name:
 *           type: string
 *           example: "test"
 *         price:
 *           type: number
 *           example: 100.0
 *         cost:
 *           type: number
 *           example: 80.0
 *         stock_quantity:
 *           type: number
 *           format: int32
 *           example: 50
 *         limit:
 *           type: number
 *           example: 5
 *         cf:
 *           type: number
 *           example: 1.0
 *         paid:
 *           type: number
 *           example: 50.0
 *         remaining_cf:
 *           type: number
 *           example: 0.5
 *         remaining:
 *           type: number
 *           example: 50.0
 *         date_added:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *         date_added:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 */
```
