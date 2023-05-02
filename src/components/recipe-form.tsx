import { FieldArray, Form, Formik } from 'formik';
import { Button } from './ui/button';
import IngredientInput from './forms/ingredient-input';
import Input from './forms/input';
import Label from './forms/label';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { api } from '../utils/api';
import type { Ingredient, Recipe, RecipeType } from '@prisma/client';
import { ArrowRight } from 'lucide-react';
import { useToast } from './ui/toast/use-toast';
import clsx from 'clsx';

const RecipeForm = ({
  recipe,
  onClose,
  onSuccess,
}: {
  recipe?: Recipe & {
    ingredients: Ingredient[];
    recipeTypes: RecipeType[];
  };
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) => {
  const { toast } = useToast();

  const {
    data: recipeTypes,
    isLoading,
    // refetch,
  } = api.recipeType.getRecipeTypes.useQuery();

  const recipeFormSchema = z.object({
    name: z.string().min(1),
    instructions: z.string().min(1),
    recipeTypes: z.array(z.string().min(1)).optional(),
    imageUrl: z.string().min(1),
    ingredients: z.array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().min(0),
        unit: z.string().min(1),
      })
    ),
  });

  const { mutateAsync: createRecipe, isLoading: isCreatingRecipe } =
    api.recipe.createRecipe.useMutation({
      onSuccess: async () => {
        await onSuccess();

        toast({
          title: 'Recipe created',
        });
      },
    });

  const { mutateAsync: updateRecipe, isLoading: isUpdatingRecipe } =
    api.recipe.updateRecipe.useMutation({
      onSuccess: async () => {
        await onSuccess();

        toast({
          title: 'Recipe updated',
        });
      },
    });

  return (
    <div className="p-6">
      <div className="absolute right-0 top-0 p-4">
        <button
          className="rounded-full bg-gray-100 p-2 transition-all ease-in-out hover:bg-gray-200"
          onClick={() => onClose()}
        >
          <ArrowRight></ArrowRight>
        </button>
      </div>
      <h2 className="mb-6 text-3xl font-bold">
        {recipe ? 'Update' : 'Create a new'} Recipe
      </h2>
      <Formik
        initialValues={{
          name: recipe?.name ?? '',
          instructions: recipe?.instructions ?? '',
          imageUrl: recipe?.imageUrl ?? '',
          recipeTypeIds:
            recipe?.recipeTypes.map((recipeType) => recipeType.id) ??
            ([] as string[]),
          ingredients:
            recipe?.ingredients.map(
              (ingredient) =>
                ({
                  id: ingredient.id,
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                } as Ingredient)
            ) ??
            ([
              {
                id: '',
                name: '',
                quantity: 0,
                unit: '',
              },
            ] as Ingredient[]),
        }}
        validationSchema={toFormikValidationSchema(recipeFormSchema)}
        onSubmit={async (values) => {
          console.log(values);
          if (recipe) {
            console.log('updating recipe');

            await updateRecipe({
              id: recipe.id,
              ...values,
            });
          } else {
            await createRecipe(values);
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col">
            <Input label="Name" name="name" />
            <Input
              label="Image URL"
              subLabel='You can find any image on the internet and right click it to get the url using "Copy Image Address"'
              name="imageUrl"
            />
            <Input textArea rows={8} label="Instructions" name="instructions" />

            <Label label="Recipe Types" className="mb-2"></Label>
            <div className="mb-8 flex flex-wrap gap-2">
              {recipeTypes?.map((recipeType) => (
                <div
                  className={clsx(
                    'flex h-6 w-auto cursor-pointer items-center justify-center rounded-full bg-slate-200 p-2 text-sm tracking-wide transition-all ease-in-out hover:scale-105',
                    values.recipeTypeIds.includes(recipeType.id)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200'
                  )}
                  key={recipeType.id + recipeType.name + recipeType.icon}
                  onClick={() => {
                    if (values.recipeTypeIds.includes(recipeType.id)) {
                      setFieldValue(
                        'recipeTypeIds',
                        values.recipeTypeIds.filter(
                          (id) => id !== recipeType.id
                        )
                      );
                    } else {
                      setFieldValue('recipeTypeIds', [
                        ...values.recipeTypeIds,
                        recipeType.id,
                      ]);
                    }
                  }}
                >
                  {recipeType.icon}{' '}
                  <span className="ml-2 text-xs font-medium ">
                    {recipeType.name}
                  </span>
                </div>
              ))}
            </div>
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
                    className="mt-0"
                    variant="secondary"
                    onClick={() => {
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
            <Button
              className="mt-8 "
              type="submit"
              isSubmitting={isCreatingRecipe || isUpdatingRecipe}
            >
              {recipe ? 'Update' : 'Create'} Recipe
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RecipeForm;
