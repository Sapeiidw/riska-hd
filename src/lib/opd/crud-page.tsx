"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BaseEntity } from "./types";
import {
  baseColumns,
  createActionsColumn,
  createNumericColumn,
  createTextColumn,
} from "./columns";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface ColumnConfig {
  key: string;
  title: string;
  type?: "text" | "numeric";
}

interface CrudPageProps<T extends BaseEntity> {
  opdId: number;
  title: string;
  description: string;
  apiEndpoint: string;
  queryKey: string;
  columns: ColumnConfig[];
  defaultData: Omit<T, keyof BaseEntity>;
  FormComponent: React.ComponentType<{
    initialData: T;
    onSuccess: () => void;
  }>;
}

export function CrudPage<T extends BaseEntity>({
  opdId,
  title,
  description,
  apiEndpoint,
  queryKey,
  columns,
  defaultData,
  FormComponent,
}: CrudPageProps<T>) {
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.role === "admin";

  const createDefaultEntity = useCallback(
    (): T =>
      ({
        id: null,
        periode: new Date(),
        tahun: new Date().getFullYear(),
        bulan: "",
        id_opd: opdId,
        nama_opd: "",
        ...defaultData,
      }) as T,
    [defaultData, opdId]
  );

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [currentData, setCurrentData] = useState<T>(createDefaultEntity);

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [queryKey, opdId],
    queryFn: () =>
      fetch(`/api/${apiEndpoint}?id_opd=${opdId}`).then((res) => res.json()),
  });

  const deleteMutation = useMutation({
    mutationKey: [`delete-${queryKey}`, opdId],
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/${apiEndpoint}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Data berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: [queryKey, opdId] });
    },
    onError: () => {
      toast.error("Gagal menghapus data");
    },
  });

  const handleEdit = useCallback((data: T) => {
    setIsOpenForm(true);
    setCurrentData({ ...data, periode: new Date(data.periode) });
  }, []);

  const handleDelete = useCallback(
    (data: T) => {
      if (data.id) deleteMutation.mutate(data.id);
    },
    [deleteMutation]
  );

  const handleSuccess = useCallback(() => {
    setIsOpenForm(false);
    setCurrentData(createDefaultEntity());
  }, [createDefaultEntity]);

  const tableColumns = useMemo((): ColumnDef<T>[] => {
    const cols: ColumnDef<T>[] = [...baseColumns<T>()];

    columns.forEach(({ key, title, type }) => {
      cols.push(
        type === "text"
          ? createTextColumn<T>(key, title)
          : createNumericColumn<T>(key, title)
      );
    });

    cols.push(createActionsColumn<T>(handleEdit, handleDelete, isAdmin));
    return cols;
  }, [columns, handleEdit, handleDelete, isAdmin]);

  return (
    <>
      <h1 className="text-2xl font-bold col-span-full">{title}</h1>
      <Dialog open={isOpenForm} onOpenChange={setIsOpenForm}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpenForm(true)} disabled={!isAdmin}>
            Add
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form {title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <FormComponent initialData={currentData} onSuccess={handleSuccess} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="col-span-full">
        {data && <DataTable columns={tableColumns} data={data} />}
      </div>
    </>
  );
}
