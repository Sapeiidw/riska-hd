"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Patient = {
  id: string;
  medicalRecordNumber: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string | null;
  insuranceType: string | null;
  isActive: boolean;
  createdAt: string;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "medicalRecordNumber",
    header: "No. RM",
  },
  {
    accessorKey: "name",
    header: "Nama Pasien",
  },
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return gender === "male" ? "Laki-laki" : "Perempuan";
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Tanggal Lahir",
    cell: ({ row }) => {
      const date = row.getValue("dateOfBirth") as string;
      return format(new Date(date), "dd MMM yyyy", { locale: id });
    },
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "insuranceType",
    header: "Asuransi",
    cell: ({ row }) => {
      const type = row.getValue("insuranceType") as string | null;
      if (!type) return "-";
      return (
        <Badge variant="outline">
          {type === "bpjs" ? "BPJS" : type === "private" ? "Swasta" : "Umum"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/master/patients/${patient.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
            </Link>
            <Link href={`/master/patients/${patient.id}/edit`}>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
