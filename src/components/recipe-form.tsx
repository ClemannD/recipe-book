import { FieldArray, Form, Formik } from 'formik';
import Button from './button';
import IngredientInput from './forms/ingredient-input';
import Input from './forms/input';
import Label from './forms/label';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { api } from '../utils/api';
import type { Ingredient, Recipe, RecipeType } from '@prisma/client';

const RecipeForm = ({
  recipe,
}: {
  recipe?: Recipe & {
    ingredients: Ingredient[];
    recipeTypes: RecipeType[];
  };
}) => {
  const recipeFormSchema = z.object({
    name: z.string().min(1),
    instructions: z.string().min(1),
    // imageUrl: z.string().min(1),
    ingredients: z.array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().min(1),
        unit: z.string().min(1),
      })
    ),
  });

  const { mutate: createRecipe, isLoading: isCreatingRecipe } =
    api.recipe.createRecipe.useMutation({
      onSuccess: () => {},
    });

  return (
    <div>
      <h2 className="mb-10 text-3xl">Create a new Recipe</h2>
      <Formik
        initialValues={{
          name: recipe?.name ?? '',
          instructions: recipe?.instructions ?? '',
          imageUrl: recipe?.imageUrl ?? '',
          ingredients:
            recipe?.ingredients.map(
              (ingredient) =>
                ({
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                } as Ingredient)
            ) ??
            ([
              {
                name: '',
                quantity: 0,
                unit: '',
              },
            ] as Ingredient[]),
        }}
        validationSchema={toFormikValidationSchema(recipeFormSchema)}
        onSubmit={(values) => {
          console.log(values);
          createRecipe(values);
        }}
      >
        {({ values }) => (
          <Form>
            <Input label="Name" name="name" />
            <Input label="Instructions" name="instructions" />
            <FieldArray name="ingredients">
              {({ insert, remove, push }) => (
                <div>
                  {/* <h3 className="text-2xl">Ingredients</h3> */}
                  <div className="grid grid-cols-10 gap-4">
                    <div className="col-span-5">
                      <Label label="Ingredient Name"></Label>
                    </div>
                    <div className="col-span-2">
                      <Label label="Quantity"></Label>
                    </div>
                    <div className="col-span-2">
                      <Label label="Unit"></Label>
                    </div>
                  </div>
                  {values.ingredients.length > 0 &&
                    values.ingredients.map((ingredient, index) => (
                      <IngredientInput
                        key={index}
                        index={index}
                        remove={remove}
                        namePrefix={`ingredients.${index}`}
                      />
                    ))}
                  <Button
                    clickHandler={() => {
                      push({
                        name: '',
                        quantity: 0,
                        unit: '',
                      });
                    }}
                  >
                    Add Ingredient
                  </Button>
                </div>
              )}
            </FieldArray>
            <Button className="mt-4" type="submit">
              Create
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RecipeForm;
