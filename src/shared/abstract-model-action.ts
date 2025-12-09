import { Injectable } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  FindOptionsOrder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  computePaginationMeta,
  PaginationMeta,
} from '@helpers/pagination.helper';

export interface CreateRecordGeneric<T> {
  createPayload: T;
  transactionOptions?: {
    useTransaction: boolean;
    transaction?: EntityManager;
  };
}

export interface UpdateRecordGeneric<T, U> {
  updatePayload: T;
  identifierOptions: U;
  transactionOptions?: {
    useTransaction: boolean;
    transaction?: EntityManager;
  };
}

export interface DeleteRecordGeneric<T> {
  identifierOptions: T;
  transactionOptions?: {
    useTransaction: boolean;
    transaction?: EntityManager;
  };
}

export interface ListRecordGeneric<T> {
  filterRecordOptions?: T;
  paginationPayload?: { limit: number; page: number };
  relations?: string[] | Record<string, boolean>;
  order?: FindOptionsOrder<T>;
}

@Injectable()
export abstract class AbstractModelAction<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entity: new () => T,
  ) {}

  async create(
    createRecordOptions: CreateRecordGeneric<DeepPartial<T>>,
  ): Promise<T | null> {
    const { createPayload, transactionOptions } = createRecordOptions;

    if (transactionOptions?.useTransaction && transactionOptions.transaction) {
      return (await transactionOptions.transaction.save(
        this.entity,
        createPayload,
      )) as T;
    }

    const entity = this.repository.create(createPayload);
    return await this.repository.save(entity);
  }

  async update(
    updateRecordOptions: UpdateRecordGeneric<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ): Promise<T | null> {
    const { updatePayload, identifierOptions, transactionOptions } =
      updateRecordOptions;

    if (transactionOptions?.useTransaction && transactionOptions.transaction) {
      await transactionOptions.transaction.update(
        this.entity,
        identifierOptions,
        updatePayload,
      );
      return await transactionOptions.transaction.findOne(this.entity, {
        where: identifierOptions,
      } as FindOneOptions<T>);
    }

    await this.repository.update(identifierOptions, updatePayload);
    return await this.repository.findOne({
      where: identifierOptions,
    } as FindOneOptions<T>);
  }

  async delete(
    deleteRecordOptions: DeleteRecordGeneric<FindOptionsWhere<T>>,
  ): Promise<void> {
    const { identifierOptions, transactionOptions } = deleteRecordOptions;

    if (transactionOptions?.useTransaction && transactionOptions.transaction) {
      await transactionOptions.transaction.delete(
        this.entity,
        identifierOptions,
      );
      return;
    }

    await this.repository.delete(identifierOptions);
  }

  async get(
    getRecordIdentifierOptions: object,
    queryOptions?: object,
    relations?: string[] | Record<string, boolean>,
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: getRecordIdentifierOptions as FindOptionsWhere<T>,
      ...queryOptions,
      relations: relations,
    } as FindOneOptions<T>);
  }

  async list(
    listRecordOptions: ListRecordGeneric<object>,
  ): Promise<{ payload: T[]; paginationMeta: Partial<PaginationMeta> }> {
    const {
      filterRecordOptions = {},
      paginationPayload,
      relations,
      order,
    } = listRecordOptions;

    const limit = paginationPayload?.limit || 10;
    const page = paginationPayload?.page || 1;
    const skip = (page - 1) * limit;

    const orderBy: FindOptionsOrder<T> = order
      ? (order as FindOptionsOrder<T>)
      : ({ createdAt: 'DESC' } as unknown as FindOptionsOrder<T>);

    const [payload, total] = await this.repository.findAndCount({
      where: filterRecordOptions as FindOptionsWhere<T>,
      relations: relations,
      order: orderBy,
      take: limit,
      skip,
    } as FindManyOptions<T>);

    return {
      payload,
      paginationMeta: computePaginationMeta(total, limit, page),
    };
  }

  async transaction<TResult>(
    runInTransaction: (manager: EntityManager) => Promise<TResult>,
  ): Promise<TResult> {
    return await this.repository.manager.transaction(runInTransaction);
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async count(where: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }
}

