import type { Ingredient, Recipe, RecipeType } from '@prisma/client';
import clsx from 'clsx';
import { FieldArray, Form, Formik } from 'formik';
import { X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { api } from '../../utils/api';
import IngredientInput from '../forms/ingredient-input';
import Input from '../forms/input';
import Label from '../forms/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/toast/use-toast';

const RecipeForm = ({
  recipe,
  onClose,
  onSuccess,
  onDelete,
}: {
  recipe?: Recipe & {
    ingredients: Ingredient[];
    recipeTypes: RecipeType[];
  };
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onDelete?: () => Promise<void>;
}) => {
  const { toast, dismiss } = useToast();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: recipeTypes } = api.recipeType.getRecipeTypes.useQuery();

  const recipeFormSchema = z.object({
    name: z.string().min(1),
    instructions: z.string().max(2500).optional(),
    imageUrl: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
    recipeTypes: z.array(z.string().min(1)).optional(),
    ingredients: z
      .array(
        z.object({
          name: z.string().max(40).optional(),
          quantity: z.number().min(0),
          unit: z.string().max(30).optional(),
        })
      )
      .optional(),
  });

  const { mutateAsync: createRecipe } = api.recipe.createRecipe.useMutation({
    onSuccess: async () => {
      await onSuccess();
      setIsDuplicating(false);
      setIsCreating(false);
      toast({
        title: '✅ Recipe created',
      });
    },
    onError: (error) => {
      setIsCreating(false);

      console.error(error);

      toast({
        title: 'Error creating recipe',
        description: error.message,
      });
    },
  });

  const { mutateAsync: updateRecipe } = api.recipe.updateRecipe.useMutation({
    onSuccess: async () => {
      await onSuccess();
      setIsCreating(false);

      toast({
        title: '✅ Recipe updated',
      });
    },
    onError: (error) => {
      setIsCreating(false);
      console.error(error);

      toast({
        title: 'Error updating recipe',
        description: 'Please check form inputs and try again.',
      });
    },
  });

  const { mutate: deleteRecipe, isLoading: isDeletingRecipe } =
    api.recipe.deleteRecipe.useMutation({
      onSuccess: async () => {
        if (!onDelete) {
          return;
        }

        await onDelete();

        toast({
          title: 'Recipe deleted',
        });
      },
      onError: (error) => {
        setIsCreating(false);
        console.error(error);

        toast({
          title: 'Error deleting recipe',
          description: error.message,
        });
      },
    });

  return (
    <div className="p-4 pb-32 lg:p-6">
      <div className="absolute right-0 top-0 p-4">
        <button
          className="rounded-full border bg-gray-100 p-2 transition-colors ease-in-out hover:bg-gray-200"
          onClick={() => onClose()}
        >
          <X></X>
        </button>
      </div>

      <h2 className="mb-6 text-3xl font-bold">
        {recipe ? 'Update' : 'Create a new'} Recipe
      </h2>
      <Formik
        initialValues={{
          name: recipe?.name ?? '',
          instructions: recipe?.instructions ?? '',
          isPublic: recipe?.isPublic ?? false,
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
          // Delete empty ingredients
          values.ingredients = values.ingredients.filter(
            (ingredient) =>
              ingredient.name || ingredient.quantity || ingredient.unit
          );

          if (recipe) {
            setIsCreating(true);
            await updateRecipe({
              id: recipe.id,
              ...values,
            });
          } else {
            setIsCreating(true);
            await createRecipe(values);
          }
        }}
      >
        {({ values, setFieldValue, errors }) => (
          <Form className="flex flex-col">
            <Input label="Name" name="name" required />
            <Input
              label="Image URL"
              subLabel='You can find any image on the internet and right click it to get the url using "Copy Image Address". (Image Upload Coming Soon!)'
              name="imageUrl"
            />
            <Input textArea rows={8} label="Instructions" name="instructions" />

            <Label label="Recipe Types" className="mb-2"></Label>
            <div className="mb-8 flex flex-wrap gap-1">
              {recipeTypes?.map((recipeType) => (
                <div
                  className={clsx(
                    'flex h-6 w-auto cursor-pointer select-none items-center justify-center  rounded-full bg-slate-50 p-2 text-sm tracking-wide transition ease-in-out hover:scale-105',
                    values.recipeTypeIds.includes(recipeType.id)
                      ? 'border border-slate-200 bg-slate-900 text-white'
                      : 'border bg-slate-200'
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
                  <div className="grid grid-cols-10 gap-2">
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
                  {values.ingredients.map((_, index) => (
                    <IngredientInput
                      key={index}
                      index={index}
                      remove={remove}
                      namePrefix={`ingredients.${index}`}
                      onKeyDownTrashIcon={(e) => {
                        if (
                          e.key === 'Tab' &&
                          index === values.ingredients.length - 1 &&
                          values.ingredients[index]!.name !== '' &&
                          values.ingredients[index]!.quantity !== null &&
                          values.ingredients[index]!.unit !== ''
                        ) {
                          push({
                            name: '',
                            quantity: 0,
                            unit: '',
                          });
                        }
                      }}
                    />
                  ))}

                  <Button
                    className="mt-2 w-full"
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

            <Label
              className="mt-8"
              label="Public Recipe"
              subLabel="Marking this as public will let anybody see it"
            ></Label>
            <Switch
              checked={values.isPublic}
              onCheckedChange={(checked) => {
                setFieldValue('isPublic', checked);
              }}
              name="isPublic"
            />

            <Button
              className="mt-8 "
              type="submit"
              disabled={Object.keys(errors).length > 0}
              isSubmitting={isCreating}
            >
              {recipe ? 'Update' : 'Create'} Recipe
            </Button>

            {recipe && (
              <div className="mt-4 flex gap-4">
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={Object.keys(errors).length > 0}
                  isSubmitting={isDuplicating}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={async () => {
                    setIsDuplicating(true);
                    await createRecipe({
                      ...values,
                      name: `Copy of ${values.name}`,
                    });
                  }}
                >
                  Duplicate Recipe
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive-outline"
                  isSubmitting={isDeletingRecipe}
                  onClick={() => {
                    toast({
                      title: `Are you sure you want to delete this Recipe?`,
                      description: 'This action cannot be undone.',
                      duration: 10000,

                      action: (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            deleteRecipe({ id: recipe.id });
                            dismiss();
                          }}
                        >
                          Delete
                        </Button>
                      ),
                    });
                    return;
                  }}
                >
                  Delete Recipe
                </Button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RecipeForm;
