-- CreateTable
CREATE TABLE "Properties" (
    "id" SERIAL NOT NULL,
    "place" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Properties_userId_key" ON "Properties"("userId");

-- AddForeignKey
ALTER TABLE "Properties" ADD CONSTRAINT "Properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
