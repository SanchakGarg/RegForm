"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline"
import RenderPopoverForm from "@/app/components/dashboard/form/PopoverForm"
import { eventSchema, sports } from "@/app/utils/forms/schema"
import { post } from "@/app/utils/PostGetData"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { encrypt } from "@/app/utils/encryption"

export type FormData = {
  _id: string;
  title: string;
  updatedAt: string;
  status: string;
};

const ActionCell: React.FC<{ row: any }> = ({ row }) => {
  const router = useRouter();
  const { status, _id, title } = row.original;

  return (
    <div className="flex justify-center">
      {status === "draft" ? (
        <Button
          onClick={() =>
            router.push(`/dashboard/regForm/form?i=${encrypt({ id: _id, title: title })}`)
          }
        >
          Edit
        </Button>
      ) : (
        <Button disabled>Edit</Button>
      )}
    </div>
  );
};

const columns: ColumnDef<FormData>[] = [
  {
    accessorKey: "title",
    header: "Sports",
    cell: ({ row }) => {
      const title = row.original.title;
      const matchingSport = sports[title];
      return matchingSport || "Unknown";
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Time",
    cell: (info) => {
      const date = new Date(info.getValue() as string);
      return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    header: "Edit Form",
    cell: ({ row }) => <ActionCell row={row} />, // Use the new functional component
  },
];

const getAuthToken = (): string | null => {
  const cookies = document.cookie.split("; ")
  const authToken = cookies.find((cookie) => cookie.startsWith("authToken="))
  return authToken ? authToken.split("=")[1] : null
}

export default function RegForm() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FormData[]>([])

  useEffect(() => {
    const getForms = async () => {
      try {
        const token = getAuthToken()
        if (!token) {
          console.error("Auth token not found")
          setLoading(false)
          return
        }

          const response = await post<{ success: boolean; data?: FormData[] }>(
            `/api/form/getAllForms`,
            {
              cookies: token,
            }
          )

        if (response.data?.success && response.data?.data) {
          setData(response.data.data)
        } else {
          console.error("Failed to retrieve form data or no data returned.")
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
      } finally {
        setLoading(false)
      }
    }

    getForms()
  }, [])

  const DataTable = ({ columns, data }: { columns: ColumnDef<FormData>[]; data: FormData[] }) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <div className="overflow-x-auto rounded-lg shadow-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-black hover:bg-black-200 group">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-white text-center group-hover:bg-black-200 transition-colors duration-200"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    )
  }

  return (
    <div className="h-screen w-full relative">
      <div className="w-full">
        <HeadingWithUnderline
          text="Registration Forms"
          desktopSize="md:text-6xl"
          mobileSize="text-3xl sm:text-2xl"
        />
      </div>

      <div className="flex justify-start">
        <div className="">
          <RenderPopoverForm schema={eventSchema.commonPages[0].fields} meta={eventSchema.commonPages[0].meta} />
        </div>
      </div>

      <div className="w-full mt-6 pb-8 pr-5">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-center text-gray-500">
            No forms filled.
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </div>
  )
}