"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useDisclosure } from "@heroui/modal";
import toast from "react-hot-toast";
import { Alert } from "@heroui/alert";
import Dropzone from "react-dropzone";
import { Card } from "@heroui/card";

import { ApiContext } from "./providers";

import { title, subtitle } from "@/components/primitives";
import { ApiPersonsGetRequest, Person, PersonsApi } from "@/openapi";
import { DeleteIcon, EditIcon } from "@/components/icons";
import PersonModal from "@/components/person-modal";
import { ThemeSwitch } from "@/components/theme-switch";
import ConfirmationModal from "@/components/confirmation-modal";
import FilterPersonsModal from "@/components/filter-persons-modal";

export default function Home() {
  const apiContext = useContext(ApiContext);
  const personsApi = new PersonsApi(apiContext.apiConfig);

  const [personId, setPersonId] = useState<Person["personId"]>();

  const [apiPersonsGetRequest, setApiPersonsGetRequest] =
    useState<ApiPersonsGetRequest>({});

  const [confirmationModalIsBusy, setConfirmationModalIsBusy] = useState(false);
  const [personModalIsBusy, setPersonModalIsBusy] = useState(false);
  const [deletionTargetPerson, setDeletionTargetPerson] = useState<Person>();

  const filterPersonsModalDisclosure = useDisclosure();
  const addPersonModalDisclosure = useDisclosure();
  const deleteConfirmationModalDisclosure = useDisclosure();
  const editPersonModalDisclosure = useDisclosure();

  const apiPersonsGetResponse = useQuery({
    queryKey: ["apiPersonsGet", apiPersonsGetRequest],
    queryFn: () => personsApi.apiPersonsGet(apiPersonsGetRequest),
  });

  useEffect(() => {
    apiPersonsGetResponse.refetch();
  }, []);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "birthDate", label: "Birth Date" },
    { key: "income", label: "Income" },
    { key: "balance", label: "Balance" },
    { key: "actions", label: "Actions" },
  ];
  // -------------------------------------------------------------------------
  const personModalOnSave = useCallback((person: Person) => {
    setPersonModalIsBusy(true);
    toast.promise(
      async () =>
        person.personId
          ? await personsApi.apiPersonsIdPut({
              id: person.personId,
              person: person,
            })
          : await personsApi.apiPersonsPost({ person: person }),
      {
        loading: (
          <Alert title={`Saving ${person.firstName} ${person.lastName}...`} />
        ),
        success: () => {
          apiPersonsGetResponse.refetch();
          person.personId
            ? editPersonModalDisclosure.onClose()
            : addPersonModalDisclosure.onClose();
          setPersonModalIsBusy(false);

          return (
            <Alert
              color="success"
              title={`Successfully saved ${person.firstName} ${person.lastName}`}
            />
          );
        },
        error: () => {
          setPersonModalIsBusy(false);

          return (
            <Alert
              color="danger"
              title={`Error while trying to save ${person.firstName} ${person.lastName}`}
            />
          );
        },
      },
      {
        icon: <></>,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      },
    );
  }, []);
  // -------------------------------------------------------------------------
  const deleteOnConfirm = useCallback((person: Person) => {
    setConfirmationModalIsBusy(true);
    toast.promise(
      async () => {
        if (!person.personId)
          throw "Error: No target personId was detected in target Person!";

        return await personsApi.apiPersonsIdDelete({
          id: person.personId,
        });
      },
      {
        loading: (
          <Alert title={`Deleting ${person.firstName} ${person.lastName}...`} />
        ),
        success: () => {
          apiPersonsGetResponse.refetch();
          deleteConfirmationModalDisclosure.onClose();
          setConfirmationModalIsBusy(false);

          return (
            <Alert
              color="success"
              title={`Successfully deleteed ${person.firstName} ${person.lastName}`}
            />
          );
        },
        error: () => {
          setPersonModalIsBusy(false);

          return (
            <Alert
              color="danger"
              title={`Error while trying to delete ${person.firstName} ${person.lastName}`}
            />
          );
        },
      },
      {
        icon: <></>,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      },
    );
  }, []);
  // -------------------------------------------------------------------------
  const uploadFiles = useCallback(<T extends File>(acceptedFiles: T[]) => {
    toast.promise(
      async () => {
        const reader = new FileReader();

        reader.readAsText(acceptedFiles[0]);

        const csvUploadDetails = await personsApi.apiPersonsCsvGet();

        const csvUploadPath = csvUploadDetails.uploadLink!.replace(
          process.env.NEXT_PUBLIC_R2_BASE_URL!,
          "",
        );

        await fetch(`${apiContext.apiConfig.basePath}${csvUploadPath}`, {
          method: "PUT",
          headers: { "Content-Type": "text/csv" },
          body: reader.result,
        });

        return await personsApi.apiPersonsCsvPost({
          body: csvUploadDetails.objName!,
        });
      },
      {
        loading: <Alert title={"Uploading CSV..."} />,
        success: () => {
          apiPersonsGetResponse.refetch();

          return <Alert color="success" title={"Successfully uploaded CSV"} />;
        },
        error: () => {
          return <Alert color="danger" title={"Error occurred"} />;
        },
      },
      {
        icon: <></>,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      },
    );
  }, []);

  return (
    <>
      <FilterPersonsModal
        currentFilters={apiPersonsGetRequest}
        isOpen={filterPersonsModalDisclosure.isOpen}
        onApply={(filter) => {
          filterPersonsModalDisclosure.onClose();
          setApiPersonsGetRequest(filter);
        }}
        onOpenChange={filterPersonsModalDisclosure.onOpenChange}
      />
      <ConfirmationModal
        confirmColor="danger"
        isBusy={confirmationModalIsBusy}
        isOpen={deleteConfirmationModalDisclosure.isOpen}
        message={`Are you sure you want to delete ${deletionTargetPerson?.firstName} ${deletionTargetPerson?.lastName}?`}
        title="Confirm Deletion"
        onConfirm={() => {
          if (deletionTargetPerson) deleteOnConfirm(deletionTargetPerson);
        }}
        onOpenChange={deleteConfirmationModalDisclosure.onOpenChange}
      />
      <PersonModal
        isBusy={personModalIsBusy}
        isOpen={addPersonModalDisclosure.isOpen}
        title="Add Person"
        onOpenChange={addPersonModalDisclosure.onOpenChange}
        onSave={personModalOnSave}
      />
      <PersonModal
        isBusy={personModalIsBusy}
        isOpen={editPersonModalDisclosure.isOpen}
        personId={personId}
        title="Edit Person"
        onOpenChange={editPersonModalDisclosure.onOpenChange}
        onSave={personModalOnSave}
      />

      <section className="flex flex-col items-center justify-center gap-4">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title({ size: "sm" })}>The List of&nbsp;</span>
          <span className={title({ size: "sm", color: "blue" })}>Persons</span>
          <div className={subtitle({ class: "mt-4" })}>
            by Carl Eric Doromal 💖
          </div>
          <ThemeSwitch />
        </div>
        <div className="flex w-full justify-between ">
          <div className="flex gap-2">
            <Button color="primary" onPress={addPersonModalDisclosure.onOpen}>
              Add Person
            </Button>
            <Button onPress={filterPersonsModalDisclosure.onOpen}>
              Filter Persons
            </Button>
          </div>

          <div className="flex gap-2">
            <Dropzone
              noKeyboard
              maxFiles={1}
              maxSize={10240}
              multiple={false}
              onDrop={uploadFiles}
            >
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Card className="py-2 px-4">Drag and drop CSV here</Card>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
        </div>
        <div className="w-full">
          <Table
            aria-label="The List of Persons"
            classNames={{
              th: "font-bold text-base",
              td: "text-base",
            }}
          >
            <TableHeader>
              {columns.map((column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              ))}
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="flex flex-col">
                  <span>Pretty empty here, huh?</span>
                  <span>Consider adding a person or two.</span>
                </div>
              }
              isLoading={apiPersonsGetResponse.isPending}
              loadingContent={<Spinner label="Looking for Persons..." />}
            >
              <>
                {apiPersonsGetResponse.isSuccess && (
                  <>
                    {apiPersonsGetResponse.data.map((row) => (
                      <TableRow key={row.personId}>
                        {(columnKey) => {
                          switch (columnKey) {
                            case "birthDate":
                              return (
                                <>
                                  <TableCell>
                                    {row[columnKey] instanceof Date
                                      ? row[columnKey].toLocaleDateString()
                                      : "unknown"}
                                  </TableCell>
                                </>
                              );

                            case "actions":
                              return (
                                <>
                                  <TableCell className="relative flex items-center gap-2">
                                    <Tooltip
                                      content="Edit Person"
                                      placement="left"
                                    >
                                      <Button
                                        isIconOnly
                                        aria-label="Edit Person"
                                        className="text-xl text-default-400"
                                        size="sm"
                                        variant="light"
                                        onPress={() => {
                                          setPersonId(row.personId);
                                          editPersonModalDisclosure.onOpen();
                                        }}
                                      >
                                        <EditIcon />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip
                                      color="danger"
                                      content="Delete Person"
                                      placement="right"
                                    >
                                      <Button
                                        isIconOnly
                                        aria-label="Delete Person"
                                        className="text-xl text-danger"
                                        color="danger"
                                        size="sm"
                                        variant="light"
                                        onPress={() => {
                                          setDeletionTargetPerson(row);
                                          deleteConfirmationModalDisclosure.onOpen();
                                        }}
                                      >
                                        <DeleteIcon />
                                      </Button>
                                    </Tooltip>
                                  </TableCell>
                                </>
                              );

                            default:
                              return (
                                <>
                                  <TableCell>
                                    {getKeyValue(row, columnKey)}
                                  </TableCell>
                                </>
                              );
                          }
                        }}
                      </TableRow>
                    ))}
                  </>
                )}
              </>
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
