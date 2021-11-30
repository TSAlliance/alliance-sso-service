import { Injectable } from '@nestjs/common';
import { RestAccount } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { Role } from 'src/roles/role.entity';
import { RoleService, ROOT_ROLE_ID } from 'src/roles/role.service';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { Invite } from './entities/invite.entity';
import { InviteRepository } from './invite.repository';

@Injectable()
export class InviteService {

  constructor(private inviteRepository: InviteRepository, private roleService: RoleService, private userService: UserService){ }

  /**
   * Create new invite.
   * @param createInviteDto Invite data to create 
   * @param account Current account that performs request (will be set as inviter)
   * @returns Invite Entity
   */
  public async create(createInviteDto: CreateInviteDto, account: RestAccount): Promise<Invite> {    
    const invite = new Invite();
    invite.assignRole = createInviteDto.assignRole as Role;
    invite.expiresAt = createInviteDto.expiresAt;
    invite.inviter = account as User;
    invite.maxUses = createInviteDto.maxUses;
    return await this.inviteRepository.save(invite);
  }

  /**
   * Find a page of invites.
   * @param pageable Define page size and current page index number (begins with 0)
   * @returns Page of type Invite
   */
  public async findAll(pageable?: Pageable): Promise<Page<Invite>> {
    return this.inviteRepository.findAll(pageable);
  }

  /**
   * Find an invite by its id.
   * @param id ID of the invite
   * @returns Invite Entity or null
   */
  public async findById(id: string): Promise<Invite> {
    return this.inviteRepository.findById(id);
  }

  /**
   * Find an invite by its id. Including all related data like inviter and the role to assign after usage.
   * @param id ID of the invite
   * @returns Invite Entity or null
   */
  public async findByIdIncludingRelations(id: string): Promise<Invite> {
    return this.inviteRepository.findOne({ where: { id }, relations: ["assignRole", "inviter"]})
  }

  /**
   * Update existing invite.
   * @param id Invites ID
   * @param updateInviteDto Updated invite data 
   * @returns UpdateResult
   */
  public async update(id: string, updateInviteDto: UpdateInviteDto): Promise<UpdateResult> {
    return this.inviteRepository.update(id, updateInviteDto)
  }

  /**
   * Delete an invite
   * @param id Id of invite
   * @returns DeleteResult
   */
  public async delete(id: string): Promise<DeleteResult> {
    return this.inviteRepository.delete(id);
  }

  /**
   * Check if an invite is still valid.
   * @param invite Invite data to check
   * @returns True or False
   */
  public isInviteValid(invite: Invite): boolean {
    return invite.uses < invite.maxUses || (invite.expiresAt && invite.expiresAt.getTime() <= Date.now())
  }

  /**
   * Find id by role
   * @param roleId Role id to lookup
   * @returns Invite Entity
   */
  public async findByRoleId(roleId: string): Promise<Invite> {
    return this.inviteRepository.findOne({ assignRole: { id: roleId }})
  }

  /**
   * Create default invite code for setup
   */
  public async createDefaultInvite() {
    const rootRole = await this.roleService.findRootRole();

    if((await this.userService.findByRoleId(ROOT_ROLE_ID)).length <= 0) {
        const result = await this.create({
            assignRole: rootRole,
            maxUses: 1
        }, undefined)

        console.log("[]===========================================[]");
        console.log("");
        console.log("Created invite for root user account.")
        console.log("Use following code to register initial root account:")
        console.log("");
        console.log(result.id)
        console.log("");
        console.log("[]===========================================[]");
    }
  }

  
}
