import z from "zod";

export function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body;
    const result = schema.safeParse(body);

    if (result.success) {
      next();
    } else {
      return res
        .status(422)
        .json({ errors: z.treeifyError(result.error).properties });
    }
  };
}
