import {
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SupplyInvoice } from 'src/models/supply-invoice.model';
import {
  CreateSupplyInvoiceDto,
  UpdateSupplyInvoiceDto,
} from './dto/supply-invoice.dto';

@Injectable()
export class SupplyInvoiceService {
  constructor(
    @InjectModel(SupplyInvoice)
    private supplyInvoiceModel: typeof SupplyInvoice,
  ) {}

  async findAll(includeDeleted: boolean) {
    try {
      if (includeDeleted) {
        return this.supplyInvoiceModel.findAll({
          paranoid: false,
        });
      }

      return this.supplyInvoiceModel.findAll();
    } catch (error) {
      return new InternalServerErrorException(
        `Could not find supply-invoices: ${error}`,
      );
    }
  }

  async findById(id: number) {
    try {
      const supplyInvoiceFound = await this.supplyInvoiceModel.findOne({
        where: {
          id,
        },
        paranoid: false,
      });

      if (!supplyInvoiceFound)
        return new NotFoundException('Supply-invoice not found');

      return supplyInvoiceFound;
    } catch (error) {
      return new InternalServerErrorException(
        `Could not find supply-invoice: ${error}`,
      );
    }
  }

  async create(supplyInvoice: CreateSupplyInvoiceDto) {
    try {
      return this.supplyInvoiceModel.create({
        provider_id: supplyInvoice.providerId,
        invoice_type: supplyInvoice.invoiceType,
        code: supplyInvoice.code,
        delivered_at: supplyInvoice.deliveredAt ?? null,
      });
    } catch (error) {
      return new InternalServerErrorException(
        `Supply-invoice could not be created: ${error}`,
      );
    }
  }

  async update(supplyInvoice: UpdateSupplyInvoiceDto, id: number) {
    try {
      const [updatedRows] = await this.supplyInvoiceModel.update(
        supplyInvoice,
        {
          where: { id },
        },
      );

      if (updatedRows === 0)
        return new NotFoundException('Supply-invoice not found');

      return this.findById(id);
    } catch (error) {
      return new InternalServerErrorException(
        `Supply-invoice could not be updated: ${error}`,
      );
    }
  }

  async softDelete(id: number) {
    try {
      const deletedItems = await this.supplyInvoiceModel.destroy({
        where: { id },
      });

      if (deletedItems === 0)
        return new NotFoundException('Supply-invoice not found');

      return this.findById(id);
    } catch (error) {
      return new InternalServerErrorException(
        `Supply-invoice could not be deleted: ${error}`,
      );
    }
  }
}
