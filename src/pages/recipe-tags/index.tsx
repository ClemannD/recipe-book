import type { RecipeType } from '@prisma/client';
import clsx from 'clsx';
import { Form, Formik } from 'formik';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import Input from '../../components/forms/input';
import Layout from '../../components/layout';
import { Button } from '../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast/use-toast';
import { api } from '../../utils/api';
import useOnClickOutside from '../../utils/hooks/useClickOutside';
import { X } from 'lucide-react';

const RecipeTagPage: React.FC = () => {
  const {
    data: recipeTags,
    isLoading,
    refetch,
  } = api.recipeType.getRecipeTypes.useQuery();

  return (
    <Layout>
      <div className="flex">
        <div className="p-4 lg:p-10">
          <h1 className="text-2xl font-bold">Recipe Tags</h1>
          <h2 className="mt-1  text-gray-600">
            Recipe Tags are used to categorize your recipes
          </h2>

          <div className="mt-10">
            <div className="flex flex-wrap gap-4">
              {isLoading && (
                <>
                  <Skeleton className="h-20 flex-1 lg:lg:min-w-[375px]" />
                  <Skeleton className="h-20 flex-1 lg:min-w-[375px]" />
                  <Skeleton className="h-20 flex-1 lg:min-w-[375px]" />
                  <Skeleton className="h-20 flex-1 lg:min-w-[375px]" />
                  <Skeleton className="h-20 flex-1 lg:min-w-[375px]" />
                </>
              )}

              {recipeTags?.map((recipeTag) => (
                <RecipeTagBox
                  key={recipeTag.id + recipeTag.name + recipeTag.icon}
                  recipeTag={recipeTag}
                  onSubmitted={async () => {
                    await refetch();
                  }}
                />
              ))}

              <RecipeTagBox
                onSubmitted={async () => {
                  await refetch();
                }}
              />

              {/* Hack because I want flex wrap but with all elements to maintain their size */}
              <div className="h-1 max-w-[600px] flex-1 lg:min-w-[375px]"></div>
              <div className="h-1 max-w-[600px] flex-1 lg:min-w-[375px]"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeTagPage;

const RecipeTagBox = ({
  recipeTag,
  onSubmitted,
}: {
  recipeTag?: RecipeType;
  onSubmitted: () => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const recipeBoxRef = useRef<HTMLDivElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useOnClickOutside(recipeBoxRef, () => {
    if (!isPopoverOpen) {
      setIsEditing(false);
    }
  });

  return (
    <div
      ref={recipeBoxRef}
      className={clsx(
        'min-w-full flex-1 rounded border bg-white lg:min-w-[375px]',
        recipeTag &&
          !isEditing &&
          'cursor-pointer transition-all ease-in-out hover:scale-[1.02]'
      )}
      onClick={() => {
        setIsEditing(true);
      }}
    >
      <div className="flex items-center p-3">
        {isEditing || !recipeTag ? (
          <RecipeTagForm
            recipeTag={recipeTag}
            onSubmitted={onSubmitted}
            onPopoverOpened={() => {
              setIsPopoverOpen(true);
            }}
            onPopoverClosed={() => {
              setIsPopoverOpen(false);
            }}
          />
        ) : (
          <>
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 p-2 text-3xl">
              {recipeTag.icon}
            </div>
            <h3 className="text-xl font-bold">{recipeTag.name}</h3>
          </>
        )}
      </div>
    </div>
  );
};

const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false }
);

const RecipeTagForm = ({
  recipeTag,
  onSubmitted,

  onPopoverOpened,
  onPopoverClosed,
}: {
  recipeTag?: RecipeType;
  onSubmitted: () => Promise<void>;
  onPopoverOpened?: () => void;
  onPopoverClosed?: () => void;
}) => {
  const { toast } = useToast();

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(emojiPickerRef, () => {
    setIsPopoverOpen(false);
  });

  const recipeTagSchema = z.object({
    name: z.string().nonempty(),
    icon: z.string().nonempty(),
  });

  const { mutateAsync: createRecipeTag, isLoading: createIsLoading } =
    api.recipeType.createRecipeType.useMutation({
      onSuccess: async () => {
        await onSubmitted();
        toast({
          title: 'Recipe Type Created',
          description: 'Your recipe type has been created',
        });
      },
    });

  const { mutateAsync: updateRecipeTag, isLoading: updateIsLoading } =
    api.recipeType.updateRecipeType.useMutation({
      onSuccess: async () => {
        await onSubmitted();
        toast({
          title: 'Recipe Type Updated',
          description: 'Your recipe type has been updated',
        });
      },
    });

  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const { mutate: deleteRecipeTag } =
    api.recipeType.deleteRecipeType.useMutation({
      onMutate: () => {
        console.log('onMutate');
      },
      onSuccess: async () => {
        await onSubmitted();
        console.log('onSuccess');

        setDeleteIsLoading(false);
        toast({
          title: 'Recipe Type Deleted',
          description: 'Your recipe type has been deleted',
        });
      },
    });

  useEffect(() => {
    console.log('deleteIsLoading', deleteIsLoading);
  }, [deleteIsLoading]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (isPopoverOpen) {
      onPopoverOpened?.();
    } else {
      onPopoverClosed?.();
    }
  }, [isPopoverOpen, onPopoverClosed, onPopoverOpened]);

  return (
    <div className=" w-full">
      <Formik
        initialValues={{
          name: recipeTag?.name ?? '',
          icon: recipeTag?.icon ?? '🥘',
        }}
        validationSchema={toFormikValidationSchema(recipeTagSchema)}
        onSubmit={async (values, { resetForm }) => {
          console.log('values', values);
          if (!recipeTag) {
            await createRecipeTag(values);
            resetForm();
          } else {
            await updateRecipeTag({ ...values, id: recipeTag?.id });
            resetForm();
          }

          resetForm();
        }}
      >
        {({ setFieldValue, values }) => (
          <Form>
            <div className="flex items-center">
              <Popover
                open={isPopoverOpen}
                // onOpenChange={(isOpen) => setIsPopoverOpen(isOpen)}
              >
                <PopoverTrigger className="mr-4 ">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 p-2 text-3xl transition-all ease-in-out hover:scale-105"
                    onClick={(e) => {
                      setIsPopoverOpen(!isPopoverOpen);
                      e.stopPropagation();
                    }}
                  >
                    {values.icon}
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[350px] border-none p-0"
                  ref={emojiPickerRef}
                >
                  <Picker
                    onEmojiClick={(emoji) => {
                      setFieldValue('icon', emoji.emoji);
                      setIsPopoverOpen(false);
                    }}
                    skinTonesDisabled
                  />
                </PopoverContent>
              </Popover>

              <Input
                name="name"
                placeholder="Create new Type"
                className="mb-0 mr-4 flex-grow"
                hideErrorMessage
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className=""
                disabled={
                  values.name.length === 0 || createIsLoading || updateIsLoading
                }
                isSubmitting={createIsLoading || updateIsLoading}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {recipeTag ? 'Update' : 'Create'}
              </Button>

              {recipeTag && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                  disabled={deleteIsLoading}
                  isSubmitting={deleteIsLoading}
                  onClick={() => {
                    toast({
                      title: `Are you sure you want to delete ${recipeTag.name}?`,
                      description: 'This cannot be undone',
                      duration: 9000,
                      action: (
                        <Button
                          variant="destructive"
                          isSubmitting={deleteIsLoading}
                          // eslint-disable-next-line @typescript-eslint/no-misused-promises
                          onClick={(e) => {
                            deleteRecipeTag({ id: recipeTag.id });
                          }}
                        >
                          Delete
                        </Button>
                      ),
                    });
                  }}
                >
                  <X className="text-red-500 hover:text-red-600" />
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
